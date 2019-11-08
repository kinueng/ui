[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/kappnav/ui/blob/master/licenses/LICENSE)
[![Build Status](https://travis-ci.com/kappnav/ui.svg?branch=master)](https://travis-ci.com/kappnav/ui)

## kAppNav Application Viewer

### Table of Contents
* [Description](#summary)
* [Pre-Reqs](#requirements)
* [Resources and Samples](#configuration)
* [Run](#run)

<a name="summary"></a>
### Description
This project is a prototype for the kAppNav application viewer, designed to provide visualization and interaction with applications on kubernetes. 

<a name="requirements"></a>
### Pre-Reqs
#### Local Development Tools Setup (optional) 

- Install the latest [NodeJS](https://nodejs.org/en/download/) 8+ LTS version. 
- Install [Python](https://www.python.org/downloads/) (for node-gyp) v2.7.10 or higher.

#### IBM Cloud development tools setup (optional)

1. Install [Docker](https://www.docker.com/community-edition) on your machine.
2. Install [Kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl)
3. Install [Helm](https://github.com/helm/helm/blob/master/docs/install.md)
4. Install [Minishift](https://docs.okd.io/latest/minishift/getting-started/index.html) (optional)

<a name="configuration"></a>
### Install Custom Resources and Samples 

#### Custom Resources Definitions

These are the resource types the viewer reads.  Install them.

```
kubectl apply -f crds
```

#### Samples 

These are instances of the resource types the viewer reads.  Install them or your own instances and see them in the viewer.

```
kubectl apply -f samples 
```

<a name="run"></a>
### Run

#### Locally

```bash
npm install
npm run build
npm start
```

Your application is running at: `http://localhost:3000/` in your browser.

Note: you must have kubectl installed locally and configured to access your target Kubernetes cluster.
