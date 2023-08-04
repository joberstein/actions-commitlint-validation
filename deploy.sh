#!/bin/bash

SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH="release"
VERSION=$1
NEW_TAG=v${VERSION}-dist

if [ -z $VERSION ];
then
    echo "Version must be specified."
    exit
fi

echo "Clearing all changes..."
git checkout .

echo "Checking out '$TARGET_BRANCH'..."
git checkout "$TARGET_BRANCH" \
|| exit 1

echo "Removing all extra files..."
git rm -rf . \
&& rm -rf node_modules

echo "Copying files from '${SOURCE_BRANCH}' to '${TARGET_BRANCH}'"
git checkout "${SOURCE_BRANCH}" action.yml package.json package-lock.json

echo "Adding files..."
git add -vA

echo "Committing files..."
git commit -vm "Deploy $VERSION"

echo "Adding tag '${NEW_TAG}'"
git tag "$NEW_TAG"

echo "Pushing commit..."
git push origin -u "${TARGET_BRANCH}" \
&& git push --tags \
|| exit 1