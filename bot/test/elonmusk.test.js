import { buildLine }  from '../src/commands/elonmusk';

test("build line", () => {
    const companies = ['Coca-Cola'];
    const actions = {
        'eradicate': {
            'tags': ['bad']
        },
        'develop': {
            'tags': ['good']
        }
    };
    const objects = {
        'wars': {
            'tags': ['bad']
        },
        'life on earth': {
            'tags': ['good']
        }
    };

    let line = buildLine(companies, actions, objects, true);
    expect(line === 'Next I\'m buying Coca-Cola to develop wars').toBe(true);

    line = buildLine(companies, actions, objects, false);
    expect(line === 'Next I\'m buying Coca-Cola to eradicate life on earth').toBe(true);
});