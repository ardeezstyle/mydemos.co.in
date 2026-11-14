# Agent Note: Reusable Firebase Hosting Deployment with GitHub Actions and Google Cloud WIF

## 1. Objective

Configure secure, automated Firebase Hosting deployments through GitHub Actions using Google Cloud Workload Identity Federation (WIF).

The goal is to support:
- Multiple existing domains.
- Multiple GitHub repositories.
- Multiple Firebase projects.
- Additional domains and projects in the future.

**Important:** Avoid service account JSON keys and legacy Firebase CI tokens. Use GitHub OIDC and short-lived Google Cloud credentials.

The user wants to reuse the existing WIF infrastructure instead of recreating everything for each domain.

---

## 2. Existing working configuration

The following configuration has been successfully implemented and tested.

### Google Cloud

| Property | Value |
|---|---|
| Google Cloud project ID | `mydemos-co-in` |
| Google Cloud project number | `813938888698` |
| Workload Identity Pool | `github-pool` |
| OIDC Provider | `github-provider` |
| Service account | `github-firebase-deploy@mydemos-co-in.iam.gserviceaccount.com` |
| Firebase Hosting site ID | `mydemos-co-in` |

### GitHub

| Property | Value |
|---|---|
| Repository owner | `ardeezstyle` |
| Repository | `mydemos.co.in` |
| Full repository | `ardeezstyle/mydemos.co.in` |
| Deployment branch | `production` |

### Workload Identity Provider mappings

These mappings are important. The Google attribute is on the LEFT and the GitHub OIDC claim is on the RIGHT.

| Google attribute | OIDC claim |
|---|---|
| `google.subject` | `assertion.sub` |
| `attribute.repository` | `assertion.repository` |
| `attribute.ref` | `assertion.ref` |

### Provider attribute condition

Current intended restriction:

```text
assertion.repository == 'ardeezstyle/mydemos.co.in' &&
assertion.ref == 'refs/heads/production'
```

### IAM permissions

The deployment service account has:

- Firebase Hosting Admin (`roles/firebasehosting.admin`) on the relevant Firebase project.
- Workload Identity User (`roles/iam.workloadIdentityUser`) granted to the corresponding GitHub repository identity.

### GitHub repository variables

Two repository-level Actions variables are configured:

`GCP_WORKLOAD_IDENTITY_PROVIDER`

```text
projects/813938888698/locations/global/workloadIdentityPools/github-pool/providers/github-provider
```

`GCP_SERVICE_ACCOUNT`

```text
github-firebase-deploy@mydemos-co-in.iam.gserviceaccount.com
```

---

## 3. Successful GitHub Actions workflow

The following workflow is working for the existing repository.

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - production

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Lint
        run: yarn lint

      - name: Build
        run: yarn build

      - name: Authenticate with Google Cloud
        uses: google-github-actions/auth@v3
        with:
          workload_identity_provider: ${{ vars.GCP_WORKLOAD_IDENTITY_PROVIDER }}
          service_account: ${{ vars.GCP_SERVICE_ACCOUNT }}

      - name: Deploy to Firebase
        run: |
          npm install -g firebase-tools
          firebase deploy \
            --only hosting \
            --project mydemos-co-in
```

For other repositories, update the service account and Firebase project ID as appropriate.

---

## 4. Firebase configuration

Current `.firebaserc`:

```json
{
  "projects": {
    "default": "mydemos-co-in"
  }
}
```

Current `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "site": "mydemos-co-in"
  }
}
```

The explicit `site` property is important for Firebase Hosting deployment.

---

## 5. Lessons learned and mistakes to avoid

These are important. Do not repeat the earlier troubleshooting.

### A. Attribute mapping mistake

Incorrect:

```text
Google attribute: assertion.repository
```

Correct:

```text
Google attribute: attribute.repository
OIDC claim: assertion.repository
```

Custom Google attributes must start with `attribute.`.

### B. Repository identity must match exactly

The actual GitHub repository is:

```text
ardeezstyle/mydemos.co.in
```

Do not use:
- A personal GitHub username.
- A URL such as `https://github.com/ardeezstyle/mydemos.co.in`.
- A placeholder such as `YOUR_GITHUB_USERNAME/YOUR_REPOSITORY`.

The repository claim must use the exact `owner/repository` format.

### C. Provider condition and service account binding are separate

Both must be configured correctly.

Provider condition example:

```text
assertion.repository == 'ardeezstyle/mydemos.co.in' &&
assertion.ref == 'refs/heads/production'
```

Service account IAM principal binding uses:

```text
attribute.repository="ardeezstyle/mydemos.co.in"
```

Do not confuse these two configurations.

### D. Avoid incorrect or redundant IAM bindings

During troubleshooting, placeholder and URL-format repository bindings were created.

Only retain valid, necessary repository bindings.

### E. Authentication methods

Do not use:

```bash
firebase deploy --token ...
```

Do not download service account JSON keys.

Use:

```yaml
uses: google-github-actions/auth@v3
```

with GitHub OIDC permissions:

```yaml
permissions:
  contents: read
  id-token: write
```

### F. Error interpretation

| Error | Meaning |
|---|---|
| HTTP 401 invalid authentication credentials | Earlier legacy token authentication problem |
| `unauthorized_client` | WIF rejected the incoming identity |
| Credential rejected by attribute condition | Provider CEL condition did not match GitHub claims |
| Service account impersonation permission denied | Check Workload Identity User binding |
| Firebase Hosting permission denied | Check service account's Firebase Hosting IAM role |

---

## 6. Procedure for adding future domains

**Do not create a new Workload Identity Pool or OIDC provider for every repository.**

Reuse the existing:

```text
github-pool
github-provider
```

For every additional repository:

### Step 1: Collect information

Ask the user for:

- GitHub repository owner.
- GitHub repository name.
- Deployment branch.
- Firebase project ID.
- Firebase Hosting site ID.
- Whether the Firebase project is new or existing.

Never assume these values.

### Step 2: Update the provider condition

Add the new repository to the existing provider's attribute condition.

Example with multiple repositories:

```text
assertion.repository in [
  'ardeezstyle/mydemos.co.in',
  'ardeezstyle/domain-two',
  'ardeezstyle/domain-three'
] &&
assertion.ref == 'refs/heads/production'
```

Only include actual confirmed repositories.

### Step 3: Create a dedicated service account

Recommended naming:

```text
github-firebase-deploy
github-domain-two-deploy
github-domain-three-deploy
```

Prefer one dedicated service account per deployment pipeline.

Avoid broad Owner or Editor permissions.

Grant Firebase Hosting Admin on the corresponding Firebase project.

If using a central service account project and separate Firebase projects, grant the Hosting role on each appropriate target project.

### Step 4: Grant Workload Identity User

For each service account, grant:

```text
roles/iam.workloadIdentityUser
```

to the appropriate repository identity.

Principal format:

```text
principalSet://iam.googleapis.com/projects/813938888698/locations/global/workloadIdentityPools/github-pool/attribute.repository/OWNER/REPOSITORY
```

Use the correct owner and repository.

### Step 5: Configure GitHub Actions variables

In each GitHub repository:

Settings → Secrets and variables → Actions → Variables.

Add:

```text
GCP_WORKLOAD_IDENTITY_PROVIDER
```

Use the existing provider resource name if it remains in the same Google Cloud project.

Add:

```text
GCP_SERVICE_ACCOUNT
```

Use the dedicated service account email for that repository.

### Step 6: Update Firebase configuration

Set the correct Firebase Hosting site ID in `firebase.json`.

Update the Firebase project ID in `.firebaserc` and the deployment workflow.

### Step 7: Reuse the workflow

Use the working GitHub Actions workflow from Section 3.

Update only the project-specific values and retain the WIF authentication approach.

### Step 8: Test and verify

Confirm:
- Build succeeds.
- Lint succeeds.
- Google Cloud authentication succeeds.
- Firebase Hosting deployment succeeds.
- The correct site receives the deployment.

---

## 7. Important architectural considerations

1. A single WIF pool/provider can trust multiple GitHub repositories.
2. A provider condition must explicitly allow each repository.
3. A service account must separately authorize the relevant repository identity.
4. Separate service accounts are preferred for deployment isolation and least privilege.
5. If repositories belong to different Firebase projects, grant permissions on the respective target projects.
6. If future repositories use different deployment branches, account for those branches in the provider condition.
7. If repositories use different GitHub organizations or deployment policies, review the attribute condition before allowing access.
8. Do not create unnecessary duplicate pools or providers.
9. Do not store long-lived private keys or Firebase CI tokens in GitHub.

---

## 8. Instructions for the next ChatGPT session

The user will attach this note when resuming the configuration.

Start by acknowledging the existing successful WIF configuration.

Do not walk the user through creating the original pool/provider again.

First collect the exact GitHub repositories and Firebase project/site IDs for the remaining domains.

Then prepare:
1. The revised provider attribute condition.
2. The service account creation and IAM permission plan.
3. The repository-specific WIF binding.
4. The GitHub Actions variables.
5. The complete deployment workflow.
6. A verification checklist.

Proceed step by step using the Google Cloud Console UI unless the user requests Cloud Shell commands.

Be especially careful with attribute mapping, CEL conditions, repository names and IAM principal formats.

The user's priority is to avoid repeating the several hours of troubleshooting required for the first deployment.

**End goal:** One reusable Google Cloud WIF infrastructure supporting all current and future Firebase Hosting deployments securely, without JSON service account keys or legacy Firebase tokens.
