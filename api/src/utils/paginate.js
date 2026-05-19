export const paginate = async (
  Model,
  filter = {},
  { page = 1, limit = 20, sort = { createdAt: -1 } } = {},
) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, data] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
  ]);

  return {
    data,
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  };
};

export const paginateAggregate = async (
  Model,
  pipeline = [],
  { page = 1, limit = 20 } = {},
) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [countResult, data] = await Promise.all([
    Model.aggregate([...pipeline, { $count: "total" }]),
    Model.aggregate([...pipeline, { $skip: skip }, { $limit: limitNum }]),
  ]);

  const total = countResult[0]?.total || 0;

  return {
    data,
    page: pageNum,
    limit: limitNum,
    total,
    pages: Math.ceil(total / limitNum),
  };
};
