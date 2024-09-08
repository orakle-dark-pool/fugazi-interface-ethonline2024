import { Header } from "../../components/header";
import tw from "twin.macro";
import { useState } from "react";
import { usePoolActionFacet } from "../../contract/pool-action-facet";
import Loading from "../../components/loading";
import styled from "@emotion/styled";
import { useFugaziOrderFacetContract } from "../../contract/fugazi-order-facet";
import { IconPlus } from "../../components/icon";

const PoolPage = () => {
  const [tokenXAmount, setTokenXAmount] = useState("");
  const [tokenXToken, setTokenXToken] = useState("FGZ");
  const [tokenYAmount, setTokenYAmount] = useState("");
  const [tokenYToken, setTokenYToken] = useState("USD");
  const [noiseLevel, setNoiseLevel] = useState<number>(0);

  const [isHovered, setIsHovered] = useState(false);

  const { isPending: isPendingGetPoolId } = usePoolActionFacet();

  const { isPending: isPendingAddLiquidity, addLiquidity } =
    useFugaziOrderFacetContract();

  const handleAddLiquidity = async () => {
    await addLiquidity(
      Number(tokenXAmount),
      tokenXToken,
      Number(tokenYAmount),
      tokenYToken,
      Math.floor(noiseLevel > 0 ? (noiseLevel / 200) * 2047 : 0)
      //noiseLevel
    );
  };

  return (
    <Wrapper>
      {isPendingGetPoolId || (isPendingAddLiquidity && <Loading />)}
      <Header />
      <Container>
        <Title>Add Liquidity to Pool</Title>
        <Contents>
          <InputWrapper>
            <InputBox>
              <InputContainer>
                <InputTitle>Token X Amount</InputTitle>

                <InputDiv>
                  <StyledInput
                    type="text"
                    value={tokenXAmount}
                    onChange={(e) => setTokenXAmount(e.target.value)}
                    placeholder="Input amount"
                  />

                  <TokenSelect
                    value={tokenXToken}
                    onChange={(e) => setTokenXToken(e.target.value)}
                  >
                    <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
                    <TokenSelectOption value="USD">USD</TokenSelectOption>
                    <TokenSelectOption value="EUR">EUR</TokenSelectOption>
                  </TokenSelect>
                </InputDiv>
              </InputContainer>
            </InputBox>

            <InputBox>
              <InputContainer>
                <InputTitle>Token Y Amount</InputTitle>

                <InputDiv>
                  <StyledInput
                    type="text"
                    value={tokenYAmount}
                    onChange={(e) => setTokenYAmount(e.target.value)}
                    placeholder="Input amount"
                  />

                  <TokenSelect
                    value={tokenYToken}
                    onChange={(e) => setTokenYToken(e.target.value)}
                  >
                    <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
                    <TokenSelectOption value="USD">USD</TokenSelectOption>
                    <TokenSelectOption value="EUR">EUR</TokenSelectOption>
                  </TokenSelect>
                </InputDiv>
              </InputContainer>
            </InputBox>

            <NoiseContainer>
              <NoiseText>Noise</NoiseText>
              <Noise
                type="range"
                min="0"
                max="200"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
              />
              <NoiseLevel>{noiseLevel}%</NoiseLevel>
            </NoiseContainer>
          </InputWrapper>

          <StyledButton
            onClick={handleAddLiquidity}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={tokenXAmount === "" || tokenYAmount === ""}
          >
            {tokenXAmount === "" || tokenYAmount === "" ? (
              "Type Amount First"
            ) : (
              <LiquidityButtonBox>
                <IconPlus color={isHovered ? "black" : "#2FF582"} />
                Add Liquidity
              </LiquidityButtonBox>
            )}
          </StyledButton>
        </Contents>
        <Description>
          When noise is set to a non-zero value, the privacy fee will be
          deducted from the first token in the pair.
          <br />
          For instance, if you select FGZ-USD, the fee will be charged in FGZ.
          <br />
          Conversely, if you choose USD-FGZ, the fee will be paid in USD.
        </Description>
      </Container>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col h-screen
`;

const Container = tw.div`
  flex flex-col items-center p-48 gap-16
`;

const Title = tw.h1`
  font-40-sb mb-4
`;

const Contents = tw.div`
  flex gap-64 items-center
`;

const LiquidityButtonBox = tw.div`
  flex gap-16 items-center justify-center
`;

const InputWrapper = tw.div`
  flex flex-col gap-16 items-center
`;

const InputContainer = tw.div`
  flex flex-col gap-24
`;

const InputDiv = tw.div`
  flex w-full items-center justify-between
`;

const InputTitle = tw.div`
  font-xxl-b w-full border-solid border-b-2 border-gray-50
  border-t-0 border-l-0 border-r-0
`;

const InputBox = tw.div`
  w-380 p-24
  rounded-lg
  bg-gray-0
`;

const StyledInput = tw.input`
  text-center w-250 h-60 
  bg-gray-50 border-none
  focus:(border-solid border-2 border-green)
  focus-visible:outline-none
  font-xl-m text-white
`;

const TokenSelect = tw.select`
  bg-transparent border-none
  focus-visible:outline-none
  font-xxl-b text-white
`;

const TokenSelectOption = tw.option`
  w-100 bg-green
`;

const SelectedToken = tw.div`
  flex font-xxl-l text-green p-2
`;

interface SwapButtonProps {
  disabled?: boolean;
}

const StyledButton = styled.button<SwapButtonProps>(({ disabled }) => [
  tw`
  bg-black text-green font-xxl-b h-48 w-300
  px-16 py-2 rounded-md 
  border-solid border-2 border-green cursor-pointer
  hover:(bg-green text-black)
`,
  disabled &&
    tw`bg-black cursor-not-allowed text-gray-100 border-gray-100 hover:(bg-black text-gray-100)`,
]);

const NoiseContainer = tw.div`
  flex items-center w-full gap-4 p-16 rounded-8
  bg-gray-0 
`;

const NoiseText = tw.div`
  flex font-xxl-b text-white 
`;

const Noise = styled.input`
  ${tw`h-10`}
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  border-radius: 10px;
  background: ${tw`bg-gray-50`};

  &::-webkit-slider-thumb {
    ${tw`bg-black border-solid border-5 border-green`}
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  &::-moz-range-thumb {
    ${tw`bg-green`}
    width: 20px;
    height: 20px;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const NoiseLevel = tw.div`
  flex font-xxl-b text-white 
`;

const Description = tw.div`
  flex font-xl-b text-white 
`;

export default PoolPage;
