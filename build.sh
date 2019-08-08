#!/bin/bash

###############################################################################
# Copyright 2019 IBM Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
###############################################################################
set -Eeo pipefail
if [ $(arch) = "ppc64le" ]; then
  ARCH=ppc64le
elif [ $(arch) = "s390x" ]; then
  ARCH=s390x
else
  ARCH=amd64
fi

IMAGE=kappnav-ui

# TODO: find a better way to make the build work without faking out the git repo
cp -r ../.git .

echo "Building ${IMAGE}"

docker build -t ${IMAGE} . 

rm -rf .git
