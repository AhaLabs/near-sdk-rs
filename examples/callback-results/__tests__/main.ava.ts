import path from 'path';
import { Gas } from 'near-units';
import { Runner } from 'near-runner-ava';

const runner = Runner.create(async ({ root }) => ({
  contract: await root.createAndDeploy(
    'contract',
    path.join(__dirname, '..', 'res', 'callback_results.wasm'),
  ),
}));

runner.test('method `a` always returns `8`', async (t, { root, contract }) => {
  t.is(
    await root.call(contract, 'a', {}),
    8
  );
});

[
  [false, 1, [false, false]],
  [true, 1, [true, false]],
  [false, 0, [false, true]],
  [true, 0, [true, true]],
].forEach(([fail_b, c_value, expected]) => {
  const args = JSON.stringify({ fail_b, c_value });
  const out = JSON.stringify(expected);
  runner.test(`call_all(${args}) == ${out}`, async (t, { root, contract }) => {
    t.deepEqual(
      await root.call(contract, 'call_all', { fail_b, c_value }, {
        gas: Gas.parse('240Tgas')
      }),
      expected
    );
  });
})