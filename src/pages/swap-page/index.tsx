import { useState } from "react";
import { Header } from "../../components/header";
import tw from "twin.macro";
import { usePoolActionFacet } from "../../contract/pool-action-facet";
import Loading from "../../components/loading";
import styled from "@emotion/styled/macro";
import { IconDown, IconRight } from "../../components/icon";
import { useFugaziOrderFacetContract } from "../../contract/fugazi-order-facet";

const SwapPage = () => {
  const [inputAmount, setInputAmount] = useState<string>("");
  const [inputToken, setInputToken] = useState<string>("FGZ");
  const [outputToken, setOutputToken] = useState<string>("USD");
  const [noiseLevel, setNoiseLevel] = useState<number>(0);

  const { isPending: isPendingGetPoolId } = usePoolActionFacet();

  const { isPending: isPendingSubmitSwapOrder, submitSwapOrder } =
    useFugaziOrderFacetContract();

  const handleSellTokenChange = (token: string) => {
    setInputToken(token);
  };

  const handleBuyTokenChange = (token: string) => {
    setOutputToken(token);
  };

  const handleSwap = async () => {
    const result = await submitSwapOrder(
      Number(inputAmount),
      inputToken,
      outputToken,
      Math.floor(noiseLevel > 0 ? (noiseLevel / 200) * 2047 : 0)
    );
    console.log("result", result);
  };

  return (
    <Wrapper>
      {isPendingGetPoolId || (isPendingSubmitSwapOrder && <Loading />)}
      <Header />
      <Container>
        <Title>Swap Encrypted Tokens</Title>
        <InputWrapper>
          <InputBox>
            <InputContainer>
              <TokenContainer>
                <TokenBox>
                  <TokenText>Sell Token</TokenText>
                  <TokenSelect
                    value={inputToken}
                    onChange={(e) => handleSellTokenChange(e.target.value)}
                  >
                    <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
                    <TokenSelectOption value="USD">USD</TokenSelectOption>
                    <TokenSelectOption value="EUR">EUR</TokenSelectOption>
                  </TokenSelect>
                </TokenBox>
                <IconRight color="#2FF582" />
                <TokenBox>
                  <TokenText>Buy Token</TokenText>
                  <TokenSelect
                    value={outputToken}
                    onChange={(e) => handleBuyTokenChange(e.target.value)}
                  >
                    <TokenSelectOption value="FGZ">FGZ</TokenSelectOption>
                    <TokenSelectOption value="USD">USD</TokenSelectOption>
                    <TokenSelectOption value="EUR">EUR</TokenSelectOption>
                  </TokenSelect>
                </TokenBox>
              </TokenContainer>

              <SwapHeadContainer>
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
              </SwapHeadContainer>

              <InputDiv>
                <StyledInput
                  type="text"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="Input amount"
                />
                <SelectedToken>{inputToken}</SelectedToken>
              </InputDiv>
            </InputContainer>
          </InputBox>
        </InputWrapper>
        <SwapButton disabled={!inputAmount} onClick={handleSwap}>
          {!inputAmount ? "Type Amount First" : "Submit Order"}
        </SwapButton>
      </Container>
    </Wrapper>
  );
};

const Wrapper = tw.div`
  flex flex-col h-screen
`;

const Container = tw.div`
  flex flex-col items-center justify-center p-48 gap-12
`;

const Title = tw.h1`
  font-40-sb text-white
`;

const InputWrapper = tw.div`
  flex flex-col items-center gap-12
`;

const TokenContainer = tw.div`
  flex items-center justify-between w-full gap-16
`;

const TokenBox = tw.div`
  flex items-center justify-center
  bg-gray-50 rounded-lg p-24 gap-12
`;

const ArrowRight = styled(IconDown)`
  transform: rotate(-90deg);
`;

const TokenText = tw.div`
  font-xl-m text-white
`;

const InputContainer = tw.div`
  flex flex-col gap-36 
`;

const InputDiv = tw.div`
  flex w-full items-center justify-center
  gap-8
`;

const SwapHeadContainer = tw.div`
  flex items-center justify-between
`;

const InputTitle = tw.div`
  flex font-xxl-b text-green w-full
`;

const NoiseContainer = tw.div`
  flex items-center w-full gap-4
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
  flex font-xxl-l text-white 
`;

const InputBox = tw.div`
  flex items-center p-48 gap-8
  rounded-lg p-2
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
  flex font-xxxl-b text-white p-2
`;

interface SwapButtonProps {
  disabled?: boolean;
}

const SwapButton = styled.button<SwapButtonProps>(({ disabled }) => [
  tw`
  bg-black text-green font-xxl-b h-48 w-300
  px-16 py-2 rounded-md 
  border-solid border-2 border-green cursor-pointer
  hover:(bg-green text-black)
`,
  disabled &&
    tw`bg-black cursor-not-allowed text-gray-100 border-gray-100
  hover:(bg-black text-gray-100)
  `,
]);

export default SwapPage;
function useFugaziOrderFacet(): { submitSwapOrder: any } {
  throw new Error("Function not implemented.");
}
