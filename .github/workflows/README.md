# GitHub Actions Workflows

## Docker Build and Push to GCP

Workflow: `docker-build-push.yml`

### Trigger

**Automatic:**
- Push tags with the following patterns:
  - `frontend-*` - Builds and pushes frontend Docker image
  - `backend-*` - Builds and pushes backend Docker image

**Manual:**
- Workflow dispatch with tag name input
- Can be triggered from GitHub Actions UI or API

### Required Secrets

Configure these in GitHub repository settings (Settings → Secrets and variables → Actions):

#### Secrets

| Name | Description | Example |
|------|-------------|---------|
| `GCP_SA_KEY` | GCP Service Account JSON key | `{"type": "service_account", ...}` |
| `GCP_PROJECT_ID` | GCP Project ID | `my-project-12345` |

#### Variables (Optional)

| Name | Description | Default |
|------|-------------|---------|
| `GCP_REGION` | GCP region for Artifact Registry | `asia-northeast1` |
| `ARTIFACT_REGISTRY_REPO` | Artifact Registry repository name | `character-manager` |

### GCP Setup

#### 1. Create Service Account

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### 2. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create character-manager \
  --repository-format=docker \
  --location=asia-northeast1 \
  --description="Character Manager Docker images"
```

#### 3. Add Secret to GitHub

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `GCP_SA_KEY`
4. Value: Contents of `github-actions-key.json`
5. Add another secret:
   - Name: `GCP_PROJECT_ID`
   - Value: Your GCP project ID

### Usage

#### Automatic: Create and push tags

```bash
# Frontend release
git tag frontend-v1.0.0
git push origin frontend-v1.0.0

# Backend release
git tag backend-v1.0.0
git push origin backend-v1.0.0
```

#### Manual: Trigger from GitHub UI

1. Go to repository Actions tab
2. Select "Build and Push Docker Images to GCP" workflow
3. Click "Run workflow" button
4. Enter tag name (e.g., `frontend-v1.0.0` or `backend-v1.0.0`)
5. Click "Run workflow"

#### Manual: Trigger from GitHub CLI

```bash
# Frontend release
gh workflow run docker-build-push.yml -f tag_name=frontend-v1.0.0

# Backend release
gh workflow run docker-build-push.yml -f tag_name=backend-v1.0.0
```

#### Manual: Trigger from API

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/docker-build-push.yml/dispatches \
  -d '{"ref":"main","inputs":{"tag_name":"frontend-v1.0.0"}}'
```

#### Resulting images

```
asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/character-manager/frontend:v1.0.0
asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/character-manager/frontend:latest

asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/character-manager/backend:v1.0.0
asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/character-manager/backend:latest
```

### Tag Format

- Tag must start with `frontend-` or `backend-`
- Version is extracted from everything after the prefix
- Examples:
  - `frontend-v1.0.0` → version: `v1.0.0`
  - `backend-2024.12.08` → version: `2024.12.08`
  - `frontend-1.2.3-rc1` → version: `1.2.3-rc1`

### Workflow Steps

1. Checkout code
2. Determine tag name (from push event or manual input)
3. Determine which service to build based on tag prefix
4. Authenticate to GCP using service account key
5. Configure Docker to use Artifact Registry
6. Extract version from tag name
7. Build Docker image with version and latest tags
8. Push both tags to Artifact Registry
9. Output image details in workflow summary

### Notes

- Manual execution uses the current branch code (typically `main`)
- Tag name validation ensures it starts with `frontend-` or `backend-`
- Both automatic and manual triggers produce identical results
- Manual execution does not create a git tag
