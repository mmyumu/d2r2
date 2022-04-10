import { buildLines }  from '../src/commands/tfbh';
import { v4 as uuidv4 } from 'uuid';

test("build lines", () => {
    const words = {'action': ['test']};
    const templates = ['**** model'];
    const conjunctions = [{
        'text': 'donc',
        'line': 2
    }];

    let lines = buildLines(words, templates, conjunctions);
    expect(lines[0] === 'test model').toBe(true);

    lines = buildLines(words, templates, conjunctions, true);
    expect(lines[0] === 'test model').toBe(true);
    expect(lines[1] === 'donc test model').toBe(true);
});