import { getSynopsis }  from '../src/commands/christianclavier';

// It reads depression.cool through the bot's config.json: a live check, run by hand with D2R2_LIVE_TESTS=1.
const live = process.env.D2R2_LIVE_TESTS ? test : test.skip;

live("get synopsis", async () => {
    const synopsis = await getSynopsis();
    console.log(synopsis);
    expect(synopsis.length > 0).toBe(true);
});
