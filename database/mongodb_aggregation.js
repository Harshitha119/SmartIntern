
/*
SmartIntern MongoDB Aggregation
Collection: recommendation_activity_logs
*/

// 1. Count recommendation activities per user
db.recommendation_activity_logs.aggregate([
  {
    $group: {
      _id: "$userId",
      totalActivities: { $sum: 1 }
    }
  },
  {
    $sort: { totalActivities: -1 }
  }
]);

// 2. Display activity counts by action type
db.recommendation_activity_logs.aggregate([
  {
    $group: {
      _id: "$action",
      total: { $sum: 1 }
    }
  },
  {
    $sort: { total: -1 }
  }
]);

// 3. Count all activity documents
db.recommendation_activity_logs.aggregate([
  {
    $count: "totalActivityLogs"
  }
]);
