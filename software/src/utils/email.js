import mailer from 'nodemailer'
import pug from 'pug'
import { htmlToText } from 'html-to-text'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class Email {
  constructor(user, url) {
    this.from = `Natours <noreply@${process.env.EMAIL_FROM}>`
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
  }

  #createTransport() {
    return mailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    })
  }

  async #send(subject, template) {
    const emailPath = path.join(__dirname, '..', 'views', 'emails', `${template}.pug`)
    const html = pug.renderFile(emailPath, {
      firstName: this.firstName,
      url: this.url,
      subject: `[Natours] ${subject}`
    })

    await this.#createTransport()
      .sendMail({
        from: this.from,
        to: this.to,
        subject,
        html,
        text: htmlToText(html)
      })
  }

  async sendWelcome() {
    await this.#send('Welcome to the Natours family!', 'welcome')
  }

  async sendPasswordReset() {
    await this.#send('Forgotten password', 'password-reset')
  }
}
