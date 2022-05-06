#!/bin/bash

# default port: 22113
# test port: 22112

cd $(dirname $0) && pwd

backend_bin/uzume-server.app 22112 this-is-e2e-test
