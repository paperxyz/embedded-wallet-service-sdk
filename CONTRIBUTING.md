## Contributing

In your PR, if you want to release a new SDK version base on the current PR, run `npm run changeset` and answer the prompts.

This will generate file(s) in the `.changeset` folder. Commit those.

Upon merge, and new PR will be opened by the changeset bot to track the changes and prepare the SDK for release.

Once you're ready for release, simply merge the `Version Packages` PR and the bot will handle maintaining a changelog, building the SDK, and releasing it to NPM.

### Reporting a security issue

Please review our [security policy](SECURITY.md) for more details.
