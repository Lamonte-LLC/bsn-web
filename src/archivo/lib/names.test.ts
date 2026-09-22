import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { displayName, initialName, splitForNickname } from './names.ts';

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

describe('initialName', () => {
  it('abbreviates to the initial and the first surname', () => {
    assert.equal(initialName('José Rafael Ortiz'), 'J. Ortiz');
    assert.equal(initialName('Mario Morales Micheo'), 'M. Morales');
    assert.equal(initialName('Ángel L. Figueroa'), 'Á. Figueroa');
    assert.equal(initialName("Mario 'Quijote' Morales Micheo"), 'M. Morales');
    assert.equal(initialName('Piculín'), 'Piculín');
  });
});

describe('displayName', () => {
  it('keeps the given names and one surname, with particles', () => {
    assert.equal(displayName('Mario Morales Micheo'), 'Mario Morales');
    assert.equal(displayName('Jezreel De Jesús Rodríguez'), 'Jezreel De Jesús');
    assert.equal(displayName('José Rafael Ortiz Rijos'), 'José Rafael Ortiz');
    assert.equal(displayName("Mario 'Quijote' Morales Micheo"), 'Mario Morales');
    assert.equal(displayName('Nathan Sobey'), 'Nathan Sobey');
    assert.equal(displayName('Jameer Nelson Jr.'), 'Jameer Nelson');
    assert.equal(displayName('Jack Edward Cooley'), 'Jack Edward Cooley');
  });
});
