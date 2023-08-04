#!/bin/bash

SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH="release"
VERSION=$1
MAJOR=$(echo "$VERSION" | cut -d '.' -f 1)
MINOR=$(echo "$VERSION" | cut -d '.' -f 1-2)
TAGS=("$MAJOR" "$MINOR" "$VERSION")


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

for tagVersion in ${TAGS[@]}; do
    TAG="v${tagVersion}-dist"
    echo "Adding tag: '${TAG}'"
    git tag --force "$TAG"
done

echo "Pushing commit..."
git push origin -u "${TARGET_BRANCH}" \
&& git push --force --tags \
|| exit 1