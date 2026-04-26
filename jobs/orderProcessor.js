const { orderQueue } = require('../config/queue');

orderQueue.process(async (job) => {
  const { orderId, userId } = job.data;

  console.log(`Processing order ${orderId} for user ${userId}`);

  // Future use cases:
  // 1. Send order confirmation email
  // 2. Notify warehouse
  // 3. Generate invoice
  // 4. Update analytics
  // 5. Trigger shipping service

  return { success: true };
});

orderQueue.on('completed', (job) => {
  console.log(`Order job ${job.id} completed`);
});

orderQueue.on('failed', (job, err) => {
  console.error(`Order job ${job.id} failed:`, err.message);
});
