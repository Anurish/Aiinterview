import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getTrackLabel, getDifficultyColor, getScoreColor, formatDuration, formatDate } from './utils';

describe('Utils', () => {
    describe('getTrackLabel', () => {
        it('should return correct label for FRONTEND', () => {
            assert.strictEqual(getTrackLabel('FRONTEND'), 'Frontend Development');
        });
        it('should return raw track if not found', () => {
            assert.strictEqual(getTrackLabel('UNKNOWN'), 'UNKNOWN');
        });
    });

    describe('getDifficultyColor', () => {
        it('should return green for BEGINNER', () => {
            assert.match(getDifficultyColor('BEGINNER'), /green/);
        });
        it('should return gray for unknown', () => {
            assert.match(getDifficultyColor('UNKNOWN'), /gray/);
        });
    });

    describe('getScoreColor', () => {
        it('should return green for score >= 80', () => {
            assert.strictEqual(getScoreColor(85), 'text-green-500');
        });
        it('should return yellow for score >= 60', () => {
            assert.strictEqual(getScoreColor(65), 'text-yellow-500');
        });
        it('should return red for score < 60', () => {
            assert.strictEqual(getScoreColor(50), 'text-red-500');
        });
    });

    describe('formatDuration', () => {
        it('should format seconds to mm:ss', () => {
            assert.strictEqual(formatDuration(65), '1:05');
            assert.strictEqual(formatDuration(60), '1:00');
            assert.strictEqual(formatDuration(5), '0:05');
        });
    });
});

