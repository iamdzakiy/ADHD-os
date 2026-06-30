import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { autoScheduleTask } from './autoSchedule';
import { recalculateFinanceHealth } from './financeTriggers';

admin.initializeApp();

// Trigger: When a new task is added, auto-schedule it.
export const onTaskCreate = functions.firestore
  .document('users/{userId}/tasks/{taskId}')
  .onCreate(async (snap, context) => {
    const task = snap.data();
    if (task.scheduled) return; // Already scheduled
    await autoScheduleTask(task, context.params.userId);
  });

// Trigger: When a transaction is added, recalculate health score.
export const onTransactionCreate = functions.firestore
  .document('users/{userId}/transactions/{txId}')
  .onCreate(async (snap, context) => {
    await recalculateFinanceHealth(context.params.userId);
  });

// Trigger: Every hour, scan for unscheduled tasks.
export const hourlyScheduler = functions.pubsub
  .schedule('0 * * * *')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
      const tasksSnapshot = await admin.firestore()
        .collection('users').doc(userDoc.id).collection('tasks')
        .where('scheduled', '==', false).get();
      
      for (const taskDoc of tasksSnapshot.docs) {
        await autoScheduleTask(taskDoc.data(), userDoc.id);
      }
    }
    return null;
  });