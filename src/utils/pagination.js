// Parses ?page & ?limit query params into safe integers.
function parsePagination(query, { defaultLimit = 10, maxLimit = 100 } = {}) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;
  if (!Number.isInteger(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  return { page, limit, offset: (page - 1) * limit };
}

function buildPagination(total, page, limit) {
  return { total, page, limit, totalPages: Math.ceil(total / limit) };
}

module.exports = { parsePagination, buildPagination };
