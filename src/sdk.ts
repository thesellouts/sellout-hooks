import { Config } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { useMemo } from 'react'
import { base, baseSepolia, Chain } from 'viem/chains'
import { useChainId, useConfig } from 'wagmi'

import {
  ContractInteractor,
  createContractInteractor
} from './contractInteractor'
import * as hooks from './hooks'

export class sdk {
  private contractInteractor: ContractInteractor
  private config: Config

  constructor(
    config: Config,
    chain: Chain,
    smartAccountClient?: SmartAccountClient
  ) {
    this.config = config
    this.contractInteractor = createContractInteractor(
      config,
      chain,
      smartAccountClient
    )
  }

  // ====================================
  // SHOW
  // ====================================
  proposeShow(input: hooks.ProposeShowType) {
    return hooks.useProposeShow(input, this.contractInteractor, this.config)
  }

  cancelShow(input: hooks.CancelShowType) {
    return hooks.useCancelShow(input, this.contractInteractor, this.config)
  }

  completeShow(input: hooks.CompleteShowType) {
    return hooks.useCompleteShow(input, this.contractInteractor, this.config)
  }

  getNumberOfVoters(input: hooks.GetNumberOfVotersInput) {
    return hooks.useGetNumberOfVoters(input, this.contractInteractor)
  }

  getShowById(input: hooks.GetShowByIdInput) {
    return hooks.useGetShowById(input, this.contractInteractor)
  }

  getShowOrganizer(input: hooks.GetShowOrganizerInput) {
    return hooks.useGetShowOrganizer(input, this.contractInteractor)
  }

  getShowStatus(input: hooks.GetShowStatusInput) {
    return hooks.useGetShowStatus(input, this.contractInteractor)
  }

  getShowToTicketProxy(input: hooks.GetShowToTicketProxyInput) {
    return hooks.useGetShowToTicketProxy(input, this.contractInteractor)
  }

  getTicketTierInfo(input: hooks.GetTicketTierInfoInput) {
    return hooks.useGetTicketTierInfo(input, this.contractInteractor)
  }

  hasTicket(input: hooks.HasTicketInput) {
    return hooks.useHasTicket(input, this.contractInteractor)
  }

  isArtist(input: hooks.IsArtistInput) {
    return hooks.useIsArtist(input, this.contractInteractor)
  }

  isOrganizer(input: hooks.IsOrganizerInput) {
    return hooks.useIsOrganizer(input, this.contractInteractor)
  }

  payout(input: hooks.PayoutType) {
    return hooks.usePayout(input, this.contractInteractor, this.config)
  }

  refundBribe(input: hooks.RefundBribeType) {
    return hooks.useRefundBribe(input, this.contractInteractor, this.config)
  }

  refundTicket(input: hooks.RefundTicketType) {
    return hooks.useRefundTicket(input, this.contractInteractor, this.config)
  }

  voteForEmergencyRefund(input: hooks.VoteForEmergencyRefundType) {
    return hooks.useVoteForEmergencyRefund(
      input,
      this.contractInteractor,
      this.config
    )
  }

  withdrawRefund(input: hooks.WithdrawRefundType) {
    return hooks.useWithdrawRefund(input, this.contractInteractor, this.config)
  }

  // ====================================
  // BOX OFFICE
  // ====================================
  getTicketPricePaid(input: hooks.GetTicketPricePaidInput) {
    return hooks.useGetTicketPricePaid(input, this.contractInteractor)
  }

  getTotalTicketsSold(input: hooks.GetTotalTicketsSoldInput) {
    return hooks.useGetTotalTicketsSold(input, this.contractInteractor)
  }

  getWalletTokenIds(input: hooks.GetWalletTokenIdsInput) {
    return hooks.useGetWalletTokenIds(input, this.contractInteractor)
  }

  isTicketOwner(input: hooks.IsTicketOwnerInput) {
    return hooks.useIsTicketOwner(input, this.contractInteractor)
  }

  // ====================================
  // SHOW VAULT
  // ====================================
  calculateTotalPayoutAmount(input: hooks.CalculateTotalPayoutAmountInput) {
    return hooks.useCalculateTotalPayoutAmount(input, this.contractInteractor)
  }

  getShowPaymentToken(input: hooks.GetShowPaymentTokenInput) {
    return hooks.useGetShowPaymentToken(input, this.contractInteractor)
  }

  getShowTokenVault(input: hooks.GetShowTokenVaultInput) {
    return hooks.useGetShowTokenVault(input, this.contractInteractor)
  }

  getShowVault(input: hooks.GetShowVaultInput) {
    return hooks.useGetShowVault(input, this.contractInteractor)
  }

  // ====================================
  // TICKET
  // ====================================
  getTicketPricePaidAndTierIndex(
    input: hooks.GetTicketPricePaidAndTierIndexInput
  ) {
    return hooks.useGetTicketPricePaidAndTierIndex(
      input,
      this.contractInteractor
    )
  }

  purchaseTickets(input: hooks.PurchaseTicketsType) {
    return hooks.usePurchaseTickets(input, this.contractInteractor, this.config)
  }

  setDefaultURIForShow(input: hooks.SetDefaultURIForShowType) {
    return hooks.useSetDefaultURIForShow(
      input,
      this.contractInteractor,
      this.config
    )
  }

  setTokenURI(input: hooks.SetTokenURIType) {
    return hooks.useSetTokenURI(input, this.contractInteractor, this.config)
  }

  // ====================================
  // VENUE
  // ====================================
  getDateVotes(input: hooks.GetDateVotesInput) {
    return hooks.useGetDateVotes(input, this.contractInteractor)
  }

  getHasDateVoted(input: hooks.GetHasDateVotedInput) {
    return hooks.useGetHasDateVoted(input, this.contractInteractor)
  }

  getHasTicketOwnerVoted(input: hooks.GetHasTicketOwnerVotedInput) {
    return hooks.useGetHasTicketOwnerVoted(input, this.contractInteractor)
  }

  getHasVoted(input: hooks.GetHasVotedInput) {
    return hooks.useGetHasVoted(input, this.contractInteractor)
  }

  getPreviousDateVote(input: hooks.GetPreviousDateVotesInput) {
    return hooks.useGetPreviousDateVote(input, this.contractInteractor)
  }

  getPreviousVote(input: hooks.GetPreviousVoteInput) {
    return hooks.useGetPreviousVote(input, this.contractInteractor)
  }

  getProposal(input: hooks.GetProposalInput) {
    return hooks.useGetProposal(input, this.contractInteractor)
  }

  getProposalPeriod(input: hooks.GetProposalPeriodInput) {
    return hooks.useGetProposalPeriod(input, this.contractInteractor)
  }

  getProposalsCount(input: hooks.GetProposalsCountInput) {
    return hooks.useGetProposalsCount(input, this.contractInteractor)
  }

  getRefunds(input: hooks.GetRefundsInput) {
    return hooks.useGetRefunds(input, this.contractInteractor)
  }

  getSelectedDate(input: hooks.GetSelectedDateInput) {
    return hooks.useGetSelectedDate(input, this.contractInteractor)
  }

  getSelectedProposalIndex(input: hooks.GetSelectedProposalIndexInput) {
    return hooks.useGetSelectedProposalIndex(input, this.contractInteractor)
  }

  getShowProposals(input: hooks.GetShowProposalsInput) {
    return hooks.useGetShowProposals(input, this.contractInteractor)
  }

  getVotingPeriods(input: hooks.GetVotingPeriodsInput) {
    return hooks.useGetVotingPeriods(input, this.contractInteractor)
  }

  submitProposal(input: hooks.SubmitProposal) {
    return hooks.useSubmitProposal(input, this.contractInteractor, this.config)
  }

  ticketHolderVenueVote(input: hooks.TicketHolderVenueVote) {
    return hooks.useTicketHolderVenueVote(
      input,
      this.contractInteractor,
      this.config
    )
  }

  vote(input: hooks.Vote) {
    return hooks.useVote(input, this.contractInteractor, this.config)
  }

  voteForDate(input: hooks.VoteForDate) {
    return hooks.useVoteForDate(input, this.contractInteractor, this.config)
  }

  // ====================================
  // REGISTRY - ARTIST
  // ====================================
  acceptArtistNomination(input: hooks.AcceptArtistNominationInput) {
    return hooks.useAcceptArtistNomination(
      input,
      this.contractInteractor,
      this.config
    )
  }

  deregisterArtist(input: hooks.DeregisterArtistInput) {
    return hooks.useDeregisterArtist(
      input,
      this.contractInteractor,
      this.config
    )
  }

  getArtist(input: hooks.GetArtistInput) {
    return hooks.useGetArtist(input, this.contractInteractor)
  }

  isArtistRegistered(input: hooks.IsArtistRegisteredInput) {
    return hooks.useIsArtistRegistered(input, this.contractInteractor)
  }

  nominateArtist(input: hooks.NominateArtistInput) {
    return hooks.useNominateArtist(input, this.contractInteractor, this.config)
  }

  updateArtist(input: hooks.UpdateArtistInput) {
    return hooks.useUpdateArtist(input, this.contractInteractor, this.config)
  }

  // ====================================
  // REGISTRY - ORGANIZER
  // ====================================
  acceptOrganizerNomination(input: hooks.AcceptOrganizerNominationInput) {
    return hooks.useAcceptOrganizerNomination(
      input,
      this.contractInteractor,
      this.config
    )
  }

  deregisterOrganizer(input: hooks.DeregisterOrganizerInput) {
    return hooks.useDeregisterOrganizer(
      input,
      this.contractInteractor,
      this.config
    )
  }

  getOrganizer(input: hooks.GetOrganizerInput) {
    return hooks.useGetOrganizer(input, this.contractInteractor)
  }

  isOrganizerRegistered(input: hooks.IsOrganizerRegisteredInput) {
    return hooks.useIsOrganizerRegistered(input, this.contractInteractor)
  }

  nominateOrganizer(input: hooks.NominateOrganizerInput) {
    return hooks.useNominateOrganizer(
      input,
      this.contractInteractor,
      this.config
    )
  }

  updateOrganizer(input: hooks.UpdateOrganizerInput) {
    return hooks.useUpdateOrganizer(input, this.contractInteractor, this.config)
  }

  // ====================================
  // REFERRAL
  // ====================================
  decrementReferralCredits(input: hooks.DecrementReferralCreditsInput) {
    return hooks.useDecrementReferralCredits(
      input,
      this.contractInteractor,
      this.config
    )
  }

  getReferralCredits(input: hooks.GetReferralCreditsInput) {
    return hooks.useGetReferralCredits(input, this.contractInteractor)
  }

  incrementReferralCredits(input: hooks.IncrementReferralCreditsInput) {
    return hooks.useIncrementReferralCredits(
      input,
      this.contractInteractor,
      this.config
    )
  }

  setCreditControlPermission(input: hooks.SetCreditControlPermissionInput) {
    return hooks.useSetCreditControlPermission(
      input,
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - VENUE
  // ====================================
  acceptVenueNomination(input: hooks.AcceptVenueNominationInput) {
    return hooks.useAcceptVenueNomination(
      input,
      this.contractInteractor,
      this.config
    )
  }

  deregisterVenue(input: hooks.DeregisterVenueInput) {
    return hooks.useDeregisterVenue(input, this.contractInteractor, this.config)
  }

  getVenue(input: hooks.GetVenueInput) {
    return hooks.useGetVenue(input, this.contractInteractor, this.config)
  }

  isVenueRegistered(input: hooks.IsVenueRegisteredInput) {
    return hooks.useIsVenueRegistered(
      input,
      this.contractInteractor,
      this.config
    )
  }

  nominateVenue(input: hooks.NominateVenueInput) {
    return hooks.useNominateVenue(input, this.contractInteractor, this.config)
  }

  updateVenue(input: hooks.UpdateVenueInput) {
    return hooks.useUpdateVenue(input, this.contractInteractor, this.config)
  }
}

// ====================================
// Hook to use SelloutSDK
// ====================================
export function useSelloutSDK(smartAccountClient?: SmartAccountClient): sdk {
  const config = useConfig()
  const chainId = useChainId()

  return useMemo(() => {
    let chain: Chain
    switch (chainId) {
      case base.id:
        chain = base
        break
      case baseSepolia.id:
        chain = baseSepolia
        break
      default:
        throw new Error(`Unsupported chain ID: ${chainId}`)
    }

    return new sdk(config, chain, smartAccountClient)
  }, [config, chainId, smartAccountClient])
}

// ====================================
// Export types
// ====================================
export type {
  CancelShowResult,
  CancelShowType,
  PayoutResult,
  PayoutType,
  ProposeShowResult,
  ProposeShowType,
  RefundBribeResult,
  RefundBribeType,
  RefundTicketResult,
  RefundTicketType,
  VoteForEmergencyRefundResult,
  VoteForEmergencyRefundType,
  WithdrawRefundResult,
  WithdrawRefundType
} from './hooks'

export interface TransactionResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}
