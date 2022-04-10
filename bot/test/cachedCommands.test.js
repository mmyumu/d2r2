import { commands}  from '../src/utils/cachedCommands';
//import { v4: uuidv4 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';

test("cachedCommands add and delete", () => {
    var dummyCommand = 'dummy';
    const cmdUuid = uuidv4();

    commands[cmdUuid] = dummyCommand;
    expect(Object.keys(commands).length).toBe(1);

    const retrievedDummyCommand = commands[cmdUuid];   
    expect(retrievedDummyCommand).toBe(dummyCommand);

    delete commands[cmdUuid];
    expect(Object.keys(commands).length).toBe(0);
});