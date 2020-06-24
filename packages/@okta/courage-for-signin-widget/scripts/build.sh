#!/bin/bash -x

# Copy handlebars precompile babel plugin
mkdir -p ../babel-plugin-handlebars-inline-precompile
cp -rf ./node_modules/@okta/babel-plugin-handlebars-inline-precompile/* ../babel-plugin-handlebars-inline-precompile/

# Webpack courage
webpack