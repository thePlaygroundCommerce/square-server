import { CatalogObject } from 'square';

export function mapArrayToMap(arr: CatalogObject[]) {
  const mappedCatalogObjects: {
    [key: string]: CatalogObject[];
  } = {};

  arr?.forEach((item) => {
    const lowerCaseItemType = item.type.toLowerCase();
    const key: string =
      lowerCaseItemType == 'category'
        ? lowerCaseItemType.slice(0, -1) + 'ies'
        : lowerCaseItemType + 's';

    mappedCatalogObjects[key] =
      mappedCatalogObjects[key] === undefined
        ? [item]
        : mappedCatalogObjects[key].concat(item);
  });
  return mappedCatalogObjects;
}
