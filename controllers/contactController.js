const ContactMessage = require('../models/ContactMessage.js');
const nodemailer = require('nodemailer');

const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    const newMessage = new ContactMessage({ name, email, subject, message });
    await newMessage.save();

    // Config Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL, // Ton email
        pass: process.env.EMAIL_PASSWORD // Ton mot de passe ou App Password
      }
    });

    await transporter.sendMail({
      from: `"Formulaire Contact" <${process.env.EMAIL}>`,
      to: process.env.MAIL_RECEIVER,
      subject: `📩 Nouveau message : ${subject}`,
      html: `
        <h3>Message de ${name} (${email})</h3>
        <p>${message}</p>
      `
    });

       // 2. Réponse automatique envoyée à l'utilisateur
       await transporter.sendMail({
        from: `"NoReply - Car-Wash" <${process.env.EMAIL}>`,
        to: email, // Adresse de l'utilisateur
        subject: `🤖 Merci pour votre message !`,
        html: `
          <p>Bonjour ${name},</p>
          <p>Merci d'avoir pris contact avec nous. Nous avons bien reçu votre message concernant : <strong>${subject}</strong>.</p>
          <p>Nous vous répondrons dans les plus brefs délais.</p>
          <br />
          <p>— L’équipe Car-Wash</p>
          <hr />
          <p style="font-size: 0.8em; color: gray;">Ceci est un message automatique. Merci de ne pas y répondre.</p>
        `,
      });

    res.status(201).json({ message: 'Message envoyé avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message :', error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message.' });
  }
};

module.exports = { sendMessage };
