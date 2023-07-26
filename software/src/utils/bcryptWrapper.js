import bcrypt from 'bcryptjs'

export const encrypt = (password) => new Promise((resolve, reject) => {
  bcrypt.hash(password, 13, (err, res) => res ? resolve(res) : reject(err))
})

export const compare = async (hash1, hash2) =>
  await bcrypt.compare(hash1, hash2)
