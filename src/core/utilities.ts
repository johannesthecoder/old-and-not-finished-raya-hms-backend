export function toBoolean(value: any): boolean | null {
  return typeof value === "string"
    ? ["true", "yes", "yeah", "yep", "awo", "correct", "valid"].includes(value.toLocaleLowerCase())
      ? true
      : false
    : typeof value === "number"
    ? value > 0
    : typeof value === "boolean"
    ? value
    : null;
}

export function isStringWithValue(value: any): boolean {
  return typeof value === "string" && value.length !== 0;
}

export function isNumber(value: any): boolean {
  return typeof value === "number" || (typeof value === "string" && !isNaN(Number(value)));
}

export function toDate(str: any): Date | null {
  const parsedDate = new Date(str);
  return !isNaN(parsedDate.getTime()) ? parsedDate : null;
}

export function allMatchingRegex(value: any): RegExp {
  return isStringWithValue(value)
    ? new RegExp(
        `.*${value
          .split("")
          .map((_) => `${_}.*`)
          .join("")}`,
        "i"
      )
    : new RegExp("");
}

export function getSortingObj(params: { sort: any; validSortFields: string[] }, alias: any = []) {
  let sort = params.sort;
  let validSortFields = params.validSortFields;
  let sortObj: any = {};

  if (typeof sort === "string") sort = [sort];
  else if (!Array.isArray(sort)) return sortObj;

  sort.forEach((field: string) => {
    let sortAfterSplit = field.split(",").map((i) => i.trim());

    if (sortAfterSplit.length > 1) {
      if (validSortFields.includes(sortAfterSplit[0])) {
        sortObj[alias[sortAfterSplit[0]] ? alias[sortAfterSplit[0]] : sortAfterSplit[0]] = [
          "desc",
          "-1",
          "reverse",
          "descending",
        ].includes(sortAfterSplit[1].toLocaleLowerCase())
          ? -1
          : 1;
      }
    } else {
      field = field.trim();
      if (validSortFields.includes(field)) sortObj[alias[field] ? alias[field] : field] = 1;
    }
  });

  return sortObj;
}

export function findDifferences(
  oldObj: any,
  newObj: any
): { [key: string]: { [key: string]: any } } {
  const differences = {};

  Object.keys(oldObj).forEach((key) => {
    if (oldObj[key] !== newObj[key]) {
      differences[key] = {
        from: oldObj[key],
        to: newObj[key],
      };
    }
  });

  return differences;
}
