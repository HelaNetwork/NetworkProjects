export const truncateAddress = (address: string, startLength: number = 6, endLength: number = 4): string => {
    if (!address) return '';
    if (address.length < startLength + endLength) return address;

    return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}; 