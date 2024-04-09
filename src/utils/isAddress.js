const isAddress = (address) => {
  return address ? "0x".includes(address.substring(0,2).toLowerCase()) : false
}

export default isAddress;

