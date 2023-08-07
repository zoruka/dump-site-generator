module.exports.headFactory = (title, description) => {
	return `
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <meta name="description" content="${description}">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
  `;
};
