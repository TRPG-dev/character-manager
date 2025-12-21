# GitHub Actions Workflows

## Docker Build and Push to GCP

Workflow: `docker-build-push.yml`

### Trigger

**Automatic:**
- Push to `master` branch - Builds and pushes both services with commit SHA (first 6 chars) as tag
- Push to `dev/**` branches - Builds and pushes both services with commit SHA (first 6 chars) as tag
- Push tags with the following patterns:
  - `frontend-*` - Builds and pushes frontend Docker image (only on master or dev/* branches)
  - `backend-*` - Builds and pushes backend Docker image (only on master or dev/* branches)

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

#### Automatic: Push to master or dev/* branches

```bash
# Merge to master - builds both services with commit SHA tag (uses prod environment)
git checkout master
git merge feature-branch
git push origin master

# Merge to dev branch - builds both services with commit SHA tag (uses dev environment)
git checkout dev/staging
git merge feature-branch
git push origin dev/staging
```

#### Automatic: Create and push tags

```bash
# Frontend release on master (uses prod environment)
git checkout master
git tag frontend-v1.0.0
git push origin frontend-v1.0.0

# Backend release on dev branch (uses dev environment)
git checkout dev/staging
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

### Workflow Jobs and Steps

#### Job: `determine-environment`
Determines whether to use `prod` or `dev` environment based on branch/tag.

| Step ID | Step Name | Description |
|---------|-----------|-------------|
| - | Checkout code | Checks out repository with full history for branch detection |
| `set-env` | Determine environment | Sets environment to `prod` for master branch/tags, `dev` for dev/* branches |

#### Job: `build-and-push`
Builds and pushes Docker images to GCP Artifact Registry.

| Step ID | Step Name | Description |
|---------|-----------|-------------|
| - | Checkout code | Checks out repository code at the triggered ref |
| - | Validate branch for tag events | Verifies tags are only created on master or dev/* branches |
| `determine-tag` | Determine tag name | Sets image tag: manual input, tag name, or first 6 chars of commit SHA |
| `determine-service` | Determine service to build | Identifies service from tag prefix (frontend-/backend-) or sets to build both for branch pushes |
| - | Authenticate to Google Cloud | Authenticates using GCP service account credentials |
| - | Set up Cloud SDK | Installs and configures gcloud CLI |
| - | Configure Docker for Artifact Registry | Configures Docker to authenticate with GCP Artifact Registry |
| `extract-version` | Extract version from tag | Extracts version from tag name (removes prefix) or uses commit SHA |
| - | Build and push Docker image (single service) | Builds and pushes single service image with version and latest tags (tag events only) |
| - | Build and push Docker images (both services) | Builds and pushes both frontend and backend images (branch push events only) |
| - | Output image details | Writes published image information to workflow summary |

### Environment Selection

- **prod environment**: Used for master branch pushes and tags created on master branch
- **dev environment**: Used for dev/* branch pushes and tags created on dev/* branches

### Notes

- Branch pushes build both frontend and backend services with commit SHA (first 6 chars) as image tag
- Tag pushes build single service (determined by tag prefix) with tag version as image tag
- Tags can only be created on master or dev/* branches (validation enforced)
- Manual execution uses the current branch code (typically `main`)
- Tag name validation ensures it starts with `frontend-` or `backend-`
- Manual execution does not create a git tag
