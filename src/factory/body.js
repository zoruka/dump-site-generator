const { version } = require('../../package.json');

const versionTag = `<div style="position: fixed; bottom: 1rem; left: 1rem;">Version: ${version}</div>`;

module.exports.bodyFactory = (content) => {
	return `
    <body style="display: flex; align-items: center; justify-content: center; flex-direction: column;">
      ${content}
      ${versionTag}
    </body>
  `;
};
