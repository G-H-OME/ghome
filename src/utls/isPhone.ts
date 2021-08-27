export const isPhone = (phone: string): boolean => {
	const regex = /^((\+|00)86)?1([358][0-9]|4[579]|66|7[0135678]|9[89])[0-9]{8}$/
	const result = !!phone.match(regex)
	return result
}
