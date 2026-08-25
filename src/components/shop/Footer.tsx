import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import FooterAccordion, { FooterLink } from "./FooterAccordion";

interface SocialLink {
  icon: keyof typeof Ionicons.glyphMap;
  url: string;
}

interface FooterProps {
  mainMenuLinks?: FooterLink[];
  resourceLinks?: FooterLink[];
  socialLinks?: SocialLink[];
  language?: string;
  currency?: string;
  storeName?: string;
  year?: number;
  onSubscribe?: (email: string) => void;
}

const DEFAULT_MAIN_MENU: FooterLink[] = [
  { label: "New Arrivals" },
  { label: "Tshirts" },
  { label: "Jackets & Hoodies" },
  { label: "Slides" },
];

const DEFAULT_RESOURCES: FooterLink[] = [
  { label: "Track Order" },
  { label: "Shipping & Returns" },
  { label: "Contact Us" },
  { label: "FAQs" },
];

const DEFAULT_SOCIALS: SocialLink[] = [
  { icon: "logo-facebook", url: "https://facebook.com" },
  { icon: "logo-twitter", url: "https://x.com" },
  { icon: "logo-instagram", url: "https://instagram.com" },
  { icon: "logo-youtube", url: "https://youtube.com" },
];

const Footer = ({
  mainMenuLinks = DEFAULT_MAIN_MENU,
  resourceLinks = DEFAULT_RESOURCES,
  socialLinks = DEFAULT_SOCIALS,
  language = "English",
  currency = "Nigeria (NGN ₦)",
  storeName = "Zipp Republic Nigeria",
  year = new Date().getFullYear(),
  onSubscribe,
}: FooterProps) => {
  const [email, setEmail] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) return;
    onSubscribe?.(email.trim());
    setEmail("");
  };

  return (
    <View style={styles.container}>
      {/* Social row */}
      <View style={styles.socialRow}>
        {socialLinks.map((social) => (
          <TouchableOpacity
            key={social.icon}
            style={styles.socialButton}
            onPress={() => Linking.openURL(social.url)}
          >
            <Ionicons name={social.icon} size={18} color="#000000" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Accordions */}
      <FooterAccordion title="Main Menu" links={mainMenuLinks} />
      <FooterAccordion title="Resources" links={resourceLinks} />

      {/* Newsletter */}
      <View style={styles.newsletter}>
        <Text style={styles.newsletterTitle}>Newsletter</Text>
        <Text style={styles.newsletterSubtitle}>
          Sign up for our newsletter and receive 10% off your first order!
        </Text>

        <View style={styles.emailRow}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#999999"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.emailInput}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={styles.emailSubmit}
            onPress={handleSubmit}
            disabled={!email.trim()}
          >
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Language / currency selectors */}
      <View style={styles.selectorRow}>
        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorText}>{language}</Text>
          <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.selector}>
          <Text style={styles.selectorText}>{currency}</Text>
          <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <View style={styles.copyrightRow}>
        <Text style={styles.copyrightText}>
          © {year} {storeName}, All rights reserved.{" "}
          <Text style={styles.link}>Powered by Shopify</Text>
        </Text>
      </View>
    </View>
  );
};

export default Footer;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 80,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  newsletter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#333333",
    paddingTop: 20,
    paddingBottom: 8,
  },
  newsletterTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: "#FFFFFF",
    marginBottom: 8,
  },
  newsletterSubtitle: {
    fontSize: 13,
    color: "#CCCCCC",
    marginBottom: 16,
    lineHeight: 18,
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 4,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48,
  },
  emailInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  emailSubmit: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#555555",
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectorText: {
    fontSize: 13,
    color: "#FFFFFF",
  },
  copyrightRow: {
    marginTop: 24,
  },
  copyrightText: {
    fontSize: 12,
    color: "#999999",
    lineHeight: 18,
  },
  link: {
    textDecorationLine: "underline",
  },
});
