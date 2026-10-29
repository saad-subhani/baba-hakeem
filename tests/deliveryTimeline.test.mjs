import test from 'node:test';
import assert from 'node:assert/strict';
import { getDeliveryTimeline } from '../lib/deliveryTimeline.mjs';

test('matches the reference dates in Pakistan after UTC midnight offset', () => {
  assert.deepEqual(getDeliveryTimeline(new Date('2026-10-28T20:00:00Z')), {
    purchasedText: 'Oct 29',
    processingText: 'Oct 29 - 30',
    deliveredText: 'Nov 02 - 03',
  });
});

test('labels ranges that cross a month or year', () => {
  assert.deepEqual(getDeliveryTimeline(new Date('2026-12-31T08:00:00Z')), {
    purchasedText: 'Dec 31',
    processingText: 'Dec 31 - Jan 01',
    deliveredText: 'Jan 04 - 05',
  });
  assert.equal(getDeliveryTimeline(new Date('2028-02-25T08:00:00Z')).deliveredText,
    'Feb 29 - Mar 01');
});
