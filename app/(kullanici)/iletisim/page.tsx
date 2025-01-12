import { Box, Paper, Stack, Text } from "@mantine/core";
import React from "react";
import {
  MdAlternateEmail, // @ işareti için
  MdLocationOn, // map pin için
  MdPhone,
} from "react-icons/md";
import InfoForm from "./components/form";
import iconClasses from "./components/icons.module.css";
import classes from "./components/page.module.css";
const InfoPage = async () => {
  return (
    <Paper className="mt-2 w-full md:mx-auto md:w-1/2" shadow="md" radius="lg">
      <div className={classes.wrapper}>
        <Stack className={classes.contacts} bg={"secondary.7"}>
          <Text fz="lg" fw={700} className={classes.title} c={"white"}>
            İletişim Bilgileri
          </Text>
          <ContactIconsList />
        </Stack>
        <InfoForm />
      </div>
    </Paper>
  );
};

export default InfoPage;
interface ContactIconProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  icon: typeof MdAlternateEmail;
  title: React.ReactNode;
  description: React.ReactNode;
}

function ContactIcon({
  icon: Icon,
  title,
  description,
  ...others
}: ContactIconProps) {
  return (
    <div className={iconClasses.wrapper} {...others}>
      <Box mr="md">
        <Icon size={24} />
      </Box>

      <div>
        <Text size="xs" className={iconClasses.title}>
          {title}
        </Text>
        <Text className={iconClasses.description}>{description}</Text>
      </div>
    </div>
  );
}

const MOCKDATA = [
  {
    title: "Email",
    description: "info@terravivashop.com",
    icon: MdAlternateEmail,
  },
  { title: "Telefon", description: "+90 (545) 421 48 45", icon: MdPhone },
  {
    title: "Adres",
    description: "Çamdibi Mah. Çamdibi Sokak No:12 İznik/Bursa",
    icon: MdLocationOn,
  },
];

function ContactIconsList() {
  const items = MOCKDATA.map((item, index) => (
    <ContactIcon key={index} {...item} />
  ));
  return <Stack>{items}</Stack>;
}
