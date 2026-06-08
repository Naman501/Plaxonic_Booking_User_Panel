import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "react-hot-toast";



export const metadata: Metadata = {
  title: "Plaxonic Rooms",
  description: "Booking Room",
};
<Script src="https://accounts.google.com/gsi/client"   strategy="beforeInteractive" async defer />

export default function RootLayout({
  children,
}:{
  children:React.ReactNode
}) {

  return (

    <html lang="en">

      <body>

        <Toaster position="top-right" />

        {children}

      </body>

    </html>

  );

}