// import { SquareClient } from 'src/square-client/square-client';
// import crypto from 'crypto';
// import json from './a';

// // const client = new SquareClient({
// //   get: () => 'EAAAEKYKheBby4tHIRfmFU-2ZleCsfLpaq6peNCto0KOKD33xdntKaY1ddwRBBAP',
// // }).getClient();

// (async function a() {
//   const b = json.objects.map(
//     ({ type, id, category_data: { name, is_top_level } }) => ({
//       id: `#category${id}`,
//       type,
//       categoryData: {
//         name,
//         is_top_level,
//       },
//     }),
//   );

//   const a = await client.catalogApi.batchDeleteCatalogObjects({
//     objectIds: [
//       'KDBVOSTKAKA4QYALXHFEXF2C',
//       'VKMQK3PY3ZCO5MPULLA7FRLH',
//       '7N66UQDXFQ2DSP2J6DVQD64S',
//       'O4DY24EVZ2IL3HO26QY4CFO3',
//       'SWRCPLQDWEATPCYLJPNI3ZBZ',
//       'SOOQR3DKYIWYKBPSEGRWWMVV',
//       'WZ3KVI2C4P3WPFENNSSL7W4E',
//       'WTMQERXONDJYHO7URLMBIQHY',
//       'VCTNO4CCTESX5EKWLHXJ7CF3',
//     ],
//   });

//   // const a = await client.catalogApi.batchUpsertCatalogObjects({
//   //   idempotencyKey: crypto.randomUUID(),
//   //   batches: [{ objects: b }],
//   // });
//   console.log(a.result);
// })();
