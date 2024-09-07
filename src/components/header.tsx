import { useEffect, useState } from "react";
import tw from "twin.macro";
import { formatEther } from "viem";
import { switchChain } from "@wagmi/core";
import { useConnect, useAccount, useDisconnect, useBalance } from "wagmi";
import { injected } from "wagmi/connectors";
import { newTestFhenixConfig } from "../configs/fhenix-config";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo-width.png";
import styled from "@emotion/styled/macro";
import { truncateAddress } from "../utils/string";

export const Header = () => {
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({ address });
  const [isItFhenixNetwork, setIsItFhenixNetwork] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const checkChain = async () => {
      if (isConnected) {
        console.log("Connected");
      }
      try {
        //const isFhenix = await switchChain(config, { chainId: 42069 });
        const isFhenix = await switchChain(newTestFhenixConfig, {
          chainId: 8008135,
        });
        setIsItFhenixNetwork(isFhenix);
      } catch (error) {
        console.error("Chain switching failed", error);
      }
    };

    checkChain();
  }, [isConnected]);

  return (
    <Wrapper>
      <ForwardContainer>
        <LogoBox>
          <Logo onClick={() => navigate("/")} src={logo} />
          {/* <Title onClick={() => navigate("/")}>FuGazi</Title> */}
        </LogoBox>

        <NavItem
          onClick={() => navigate("/swap")}
          active={pathname === "/swap"}
        >
          Swap
        </NavItem>
        <NavItem
          onClick={() => navigate("/pool")}
          active={pathname === "/pool"}
        >
          Provide Liquidity
        </NavItem>
        <NavItem
          onClick={() => navigate("/dashboard")}
          active={pathname === "/dashboard"}
        >
          Dashboard
        </NavItem>
      </ForwardContainer>
      <BackwardContainer>
        {isConnected && (
          <>
            <StyledDiv>Address: {truncateAddress(address)}</StyledDiv>
            <StyledDiv>symbol: {balance?.symbol}</StyledDiv>
            <StyledDiv>
              Balance:{" "}
              {balance?.value
                ? formatEther(balance.value).slice(0, 5) + "..."
                : "Loading..."}
            </StyledDiv>
          </>
        )}
        {!isConnected ? (
          <ConnectButton
            onClick={() =>
              connect({
                connector: injected(),
              })
            }
          >
            Connect
          </ConnectButton>
        ) : (
          <ConnectButton onClick={() => disconnect()}>Disconnect</ConnectButton>
        )}
      </BackwardContainer>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex items-center justify-between px-16
  gap-16 bg-black min-h-64 
  border-solid border-b-2 border-gray-100
  border-t-0 border-l-0 border-r-0
`;

const ForwardContainer = tw.div`
  flex items-center gap-16 min-w-600
`;

const BackwardContainer = tw.div`
  flex items-center gap-16
`;

const LogoBox = tw.div`
  flex items-center  gap-8
`;

const Logo = tw.img`
  w-100 cursor-pointer
`;

interface NavItemProps {
  active: boolean;
}

const NavItem = styled.div<NavItemProps>(({ active }) => [
  tw`
  text-gray-100 font-semibold bg-none
  cursor-pointer
  px-16 py-8 rounded-md
  hover:(text-green)
`,
  active && tw`bg-green text-black hover:text-black`,
]);

const ConnectButton = tw.button`
  border-solid border-1 border-green 
  text-green font-semibold h-36
  bg-black
  px-16 py-2 rounded-md 
  cursor-pointer
  hover:(text-black bg-green)
`;

const StyledDiv = tw.div`
  font-l-b text-white whitespace-nowrap
`;
