export const truncate = (str: string | undefined, pre: number, post?: number) => {
  if (!str) {
    return "";
  }
  const _post = post || 0;
  const len = pre + _post;
  if (str.length <= len) {
    return str;
  }
  return `${str.substring(0, pre)}...${post ? str.substring(str.length - post) : ""}`;
};

export const compareInLowerCase = (str1: string, str2: string) => {
  return str1.toLowerCase() === str2.toLowerCase();
};
