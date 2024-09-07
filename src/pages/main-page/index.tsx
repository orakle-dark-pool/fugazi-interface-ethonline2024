import tw from "twin.macro";
import { Header } from "../../components/header";

import logo from "../../assets/logo-length.png";

const MainPage = () => {
  return (
    <Wrapper>
      <Header />
      <Body>
        <ServiceDescription>
          <LogoImage
            src={logo}
            onClick={() => {
              window.location.href = "https://fugazi.xyz";
            }}
          />
          <TextBox>
            <ServiceDescriptionSubTitle>
              We are the Most Authentic and
              <br /> the Most Secure Dark Pool
            </ServiceDescriptionSubTitle>
          </TextBox>
        </ServiceDescription>
      </Body>
    </Wrapper>
  );
};

export default MainPage;

const Wrapper = tw.div`
  flex flex-col h-screen gap-48
`;

const Body = tw.div`
  flex flex-col h-full justify-center items-center
`;

const ServiceDescription = tw.div`
  flex flex-col w-full justify-center items-center gap-24
`;

const LogoImage = tw.img`
  w-400 object-contain
`;

const TextBox = tw.div`
  flex flex-col gap-24 text-center
`;

const ServiceDescriptionSubTitle = tw.div`
  text-30 leading-34 font-regular 
`;
