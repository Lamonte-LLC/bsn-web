import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitForNickname } from './names.ts';

describe('splitForNickname', () => {
  it('puts the nickname before the surname', () => {
    assert.deepEqual(splitForNickname('José Rafael Ortiz'), ['José Rafael', 'Ortiz']);
    assert.deepEqual(splitForNickname('Ángel L. Figueroa'), ['Ángel L.', 'Figueroa']);
    assert.deepEqual(splitForNickname('Mario Morales Micheo'), ['Mario', 'Morales Micheo']);
    assert.deepEqual(splitForNickname('Ángel Santiago'), ['Ángel', 'Santiago']);
    assert.deepEqual(splitForNickname('Roberto José Hatton'), ['Roberto José', 'Hatton']);
    assert.deepEqual(splitForNickname('Piculín'), ['Piculín', '']);
  });
});
