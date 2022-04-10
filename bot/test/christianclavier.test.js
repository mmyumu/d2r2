import { getSynopsis }  from '../src/commands/christianclavier';
import { v4 as uuidv4 } from 'uuid';

test("get synopsis", async () => {
    const synopsis = await getSynopsis();
    console.log(synopsis);
    expect(synopsis.length > 0).toBe(true);
});