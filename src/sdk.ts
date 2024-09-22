import { Config } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { useMemo } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { useConfig } from 'wagmi'

import {
  ContractInteractor,
  createContractInteractor
} from './contractInteractor'
import * as hooks from './hooks'

export class SelloutSDK {
  private contractInteractor: ContractInteractor
  private chainId: typeof base.id | typeof baseSepolia.id

  constructor(
    private config: Config,
    chainId: typeof base.id | typeof baseSepolia.id,
    smartAccountClient?: SmartAccountClient
  ) {
    this.chainId = chainId
    const chain = config.chains.find(c => c.id === chainId)
    if (!chain) {
      throw new Error(`Chain with id ${chainId} not found in config`)
    }
    this.contractInteractor = createContractInteractor(
      config,
      chain,
      smartAccountClient
    )
  }

  // ====================================
  // SHOW
  // ====================================
  proposeShow(input: Omit<hooks.ProposeShowType, 'chainId'>) {
    return hooks.useProposeShow({ ...input, chainId: this.chainId })
  }

  cancelShow(input: Omit<hooks.CancelShowType, 'chainId'>) {
    return hooks.useCancelShow({ ...input, chainId: this.chainId })
  }

  completeShow(input: Omit<hooks.CompleteShowType, 'chainId'>) {
    return hooks.useCompleteShow({ ...input, chainId: this.chainId })
  }

  getNumberOfVoters(input: Omit<hooks.GetNumberOfVotersInput, 'chainId'>) {
    return hooks.useGetNumberOfVoters({ ...input, chainId: this.chainId })
  }

  getShowById(input: Omit<hooks.GetShowByIdInput, 'chainId'>) {
    return hooks.useGetShowById({ ...input, chainId: this.chainId })
  }

  getShowOrganizer(input: Omit<hooks.GetShowOrganizerInput, 'chainId'>) {
    return hooks.useGetShowOrganizer({ ...input, chainId: this.chainId })
  }

  getShowStatus(input: Omit<hooks.GetShowStatusInput, 'chainId'>) {
    return hooks.useGetShowStatus({ ...input, chainId: this.chainId })
  }

  getShowToTicketProxy(
    input: Omit<hooks.GetShowToTicketProxyInput, 'chainId'>
  ) {
    return hooks.useGetShowToTicketProxy({ ...input, chainId: this.chainId })
  }

  getShowToVenueProxy(input: Omit<hooks.GetShowToVenueProxyInput, 'chainId'>) {
    return hooks.useGetShowToVenueProxy({ ...input, chainId: this.chainId })
  }

  getTicketTierInfo(input: Omit<hooks.GetTicketTierInfoInput, 'chainId'>) {
    return hooks.useGetTicketTierInfo({ ...input, chainId: this.chainId })
  }

  hasTicket(input: Omit<hooks.HasTicketInput, 'chainId'>) {
    return hooks.useHasTicket({ ...input, chainId: this.chainId })
  }

  isArtist(input: Omit<hooks.IsArtistInput, 'chainId'>) {
    return hooks.useIsArtist({ ...input, chainId: this.chainId })
  }

  isOrganizer(input: Omit<hooks.IsOrganizerInput, 'chainId'>) {
    return hooks.useIsOrganizer({ ...input, chainId: this.chainId })
  }

  payout(input: Omit<hooks.PayoutType, 'chainId'>) {
    return hooks.usePayout({ ...input, chainId: this.chainId })
  }

  refundBribe(input: Omit<hooks.RefundBribeType, 'chainId'>) {
    return hooks.useRefundBribe({ ...input, chainId: this.chainId })
  }

  refundTicket(input: Omit<hooks.RefundTicketType, 'chainId'>) {
    return hooks.useRefundTicket({ ...input, chainId: this.chainId })
  }

  voteForEmergencyRefund(
    input: Omit<hooks.VoteForEmergencyRefundType, 'chainId'>
  ) {
    return hooks.useVoteForEmergencyRefund({ ...input, chainId: this.chainId })
  }

  withdrawRefund(input: Omit<hooks.WithdrawRefundType, 'chainId'>) {
    return hooks.useWithdrawRefund({ ...input, chainId: this.chainId })
  }

  // ====================================
  // BOX OFFICE
  // ====================================
  getTicketPricePaid(input: Omit<hooks.GetTicketPricePaidInput, 'chainId'>) {
    return hooks.useGetTicketPricePaid({ ...input, chainId: this.chainId })
  }

  getTotalTicketsSold(input: Omit<hooks.GetTotalTicketsSoldInput, 'chainId'>) {
    return hooks.useGetTotalTicketsSold({ ...input, chainId: this.chainId })
  }

  getWalletTokenIds(input: Omit<hooks.GetWalletTokenIdsInput, 'chainId'>) {
    return hooks.useGetWalletTokenIds({ ...input, chainId: this.chainId })
  }

  isTicketOwner(input: Omit<hooks.IsTicketOwnerInput, 'chainId'>) {
    return hooks.useIsTicketOwner({ ...input, chainId: this.chainId })
  }

  // ====================================
  // SHOW VAULT
  // ====================================
  calculateTotalPayoutAmount(
    input: Omit<hooks.CalculateTotalPayoutAmountInput, 'chainId'>
  ) {
    return hooks.useCalculateTotalPayoutAmount({
      ...input,
      chainId: this.chainId
    })
  }

  getShowPaymentToken(input: Omit<hooks.GetShowPaymentTokenInput, 'chainId'>) {
    return hooks.useGetShowPaymentToken({ ...input, chainId: this.chainId })
  }

  getShowTokenVault(input: Omit<hooks.GetShowTokenVaultInput, 'chainId'>) {
    return hooks.useGetShowTokenVault({ ...input, chainId: this.chainId })
  }

  getShowVault(input: Omit<hooks.GetShowVaultInput, 'chainId'>) {
    return hooks.useGetShowVault({ ...input, chainId: this.chainId })
  }

  // ====================================
  // TICKET
  // ====================================
  getTicketPricePaidAndTierIndex(
    input: Omit<hooks.GetTicketPricePaidAndTierIndexInput, 'chainId'>
  ) {
    return hooks.useGetTicketPricePaidAndTierIndex({
      ...input,
      chainId: this.chainId
    })
  }

  purchaseTickets(input: Omit<hooks.PurchaseTicketsType, 'chainId'>) {
    return hooks.usePurchaseTickets({ ...input, chainId: this.chainId })
  }

  setDefaultURIForShow(input: Omit<hooks.SetDefaultURIForShowType, 'chainId'>) {
    return hooks.useSetDefaultURIForShow({ ...input, chainId: this.chainId })
  }

  setTokenURI(input: Omit<hooks.SetTokenURIType, 'chainId'>) {
    return hooks.useSetTokenURI({ ...input, chainId: this.chainId })
  }

  // ====================================
  // VENUE
  // ====================================
  getDateVotes(input: Omit<hooks.GetDateVotesInput, 'chainId'>) {
    return hooks.useGetDateVotes({ ...input, chainId: this.chainId })
  }

  getHasDateVoted(input: Omit<hooks.GetHasDateVotedInput, 'chainId'>) {
    return hooks.useGetHasDateVoted({ ...input, chainId: this.chainId })
  }

  getHasTicketOwnerVoted(
    input: Omit<hooks.GetHasTicketOwnerVotedInput, 'chainId'>
  ) {
    return hooks.useGetHasTicketOwnerVoted({ ...input, chainId: this.chainId })
  }

  getHasVoted(input: Omit<hooks.GetHasVotedInput, 'chainId'>) {
    return hooks.useGetHasVoted({ ...input, chainId: this.chainId })
  }

  getPreviousDateVote(input: Omit<hooks.GetPreviousDateVotesInput, 'chainId'>) {
    return hooks.useGetPreviousDateVote({ ...input, chainId: this.chainId })
  }

  getPreviousVote(input: Omit<hooks.GetPreviousVoteInput, 'chainId'>) {
    return hooks.useGetPreviousVote({ ...input, chainId: this.chainId })
  }

  getProposal(input: Omit<hooks.GetProposalInput, 'chainId'>) {
    return hooks.useGetProposal({ ...input, chainId: this.chainId })
  }

  getProposalPeriod(input: Omit<hooks.GetProposalPeriodInput, 'chainId'>) {
    return hooks.useGetProposalPeriod({ ...input, chainId: this.chainId })
  }

  getProposalsCount(input: Omit<hooks.GetProposalsCountInput, 'chainId'>) {
    return hooks.useGetProposalsCount({ ...input, chainId: this.chainId })
  }

  getRefunds(input: Omit<hooks.GetRefundsInput, 'chainId'>) {
    return hooks.useGetRefunds({ ...input, chainId: this.chainId })
  }

  getSelectedDate(input: Omit<hooks.GetSelectedDateInput, 'chainId'>) {
    return hooks.useGetSelectedDate({ ...input, chainId: this.chainId })
  }

  getSelectedProposalIndex(
    input: Omit<hooks.GetSelectedProposalIndexInput, 'chainId'>
  ) {
    return hooks.useGetSelectedProposalIndex({
      ...input,
      chainId: this.chainId
    })
  }

  getShowProposals(input: Omit<hooks.GetShowProposalsInput, 'chainId'>) {
    return hooks.useGetShowProposals({ ...input, chainId: this.chainId })
  }

  getVotingPeriods(input: Omit<hooks.GetVotingPeriodsInput, 'chainId'>) {
    return hooks.useGetVotingPeriods({ ...input, chainId: this.chainId })
  }

  submitProposal(input: Omit<hooks.SubmitProposal, 'chainId'>) {
    return hooks.useSubmitProposal({ ...input, chainId: this.chainId })
  }

  ticketHolderVenueVote(input: Omit<hooks.TicketHolderVenueVote, 'chainId'>) {
    return hooks.useTicketHolderVenueVote({ ...input, chainId: this.chainId })
  }

  vote(input: Omit<hooks.Vote, 'chainId'>) {
    return hooks.useVote({ ...input, chainId: this.chainId })
  }

  voteForDate(input: Omit<hooks.VoteForDate, 'chainId'>) {
    return hooks.useVoteForDate({ ...input, chainId: this.chainId })
  }

  // ====================================
  // REGISTRY - ARTIST
  // ====================================
  acceptArtistNomination(
    input: Omit<hooks.AcceptArtistNominationInput, 'chainId'>
  ) {
    return hooks.useAcceptArtistNomination({ ...input, chainId: this.chainId })
  }

  deregisterArtist(input: Omit<hooks.DeregisterArtistInput, 'chainId'>) {
    return hooks.useDeregisterArtist({ ...input, chainId: this.chainId })
  }

  getArtist(input: Omit<hooks.GetArtistInput, 'chainId'>) {
    return hooks.useGetArtist({ ...input, chainId: this.chainId })
  }

  isArtistRegistered(input: Omit<hooks.IsArtistRegisteredInput, 'chainId'>) {
    return hooks.useIsArtistRegistered({ ...input, chainId: this.chainId })
  }

  nominateArtist(input: Omit<hooks.NominateArtistInput, 'chainId'>) {
    return hooks.useNominateArtist({ ...input, chainId: this.chainId })
  }

  updateArtist(input: Omit<hooks.UpdateArtistInput, 'chainId'>) {
    return hooks.useUpdateArtist({ ...input, chainId: this.chainId })
  }

  // ====================================
  // REGISTRY - ORGANIZER
  // ====================================
  acceptOrganizerNomination(
    input: Omit<hooks.AcceptOrganizerNominationInput, 'chainId'>
  ) {
    return hooks.useAcceptOrganizerNomination({
      ...input,
      chainId: this.chainId
    })
  }

  deregisterOrganizer(input: Omit<hooks.DeregisterOrganizerInput, 'chainId'>) {
    return hooks.useDeregisterOrganizer({ ...input, chainId: this.chainId })
  }

  getOrganizer(input: Omit<hooks.GetOrganizerInput, 'chainId'>) {
    return hooks.useGetOrganizer({ ...input, chainId: this.chainId })
  }

  isOrganizerRegistered(
    input: Omit<hooks.IsOrganizerRegisteredInput, 'chainId'>
  ) {
    return hooks.useIsOrganizerRegistered({ ...input, chainId: this.chainId })
  }

  nominateOrganizer(input: Omit<hooks.NominateOrganizerInput, 'chainId'>) {
    return hooks.useNominateOrganizer({ ...input, chainId: this.chainId })
  }

  updateOrganizer(input: Omit<hooks.UpdateOrganizerInput, 'chainId'>) {
    return hooks.useUpdateOrganizer({ ...input, chainId: this.chainId })
  }

  // ====================================
  // REFERRAL
  // ====================================
  decrementReferralCredits(
    input: Omit<hooks.DecrementReferralCreditsInput, 'chainId'>
  ) {
    return hooks.useDecrementReferralCredits({
      ...input,
      chainId: this.chainId
    })
  }

  getReferralCredits(input: Omit<hooks.GetReferralCreditsInput, 'chainId'>) {
    return hooks.useGetReferralCredits({ ...input, chainId: this.chainId })
  }

  incrementReferralCredits(
    input: Omit<hooks.IncrementReferralCreditsInput, 'chainId'>
  ) {
    return hooks.useIncrementReferralCredits({
      ...input,
      chainId: this.chainId
    })
  }

  setCreditControlPermission(
    input: Omit<hooks.SetCreditControlPermissionInput, 'chainId'>
  ) {
    return hooks.useSetCreditControlPermission({
      ...input,
      chainId: this.chainId
    })
  }

  // ====================================
  // REGISTRY - VENUE
  // ====================================
  acceptVenueNomination(
    input: Omit<hooks.AcceptVenueNominationInput, 'chainId'>
  ) {
    return hooks.useAcceptVenueNomination({ ...input, chainId: this.chainId })
  }

  deregisterVenue(input: Omit<hooks.DeregisterVenueInput, 'chainId'>) {
    return hooks.useDeregisterVenue({ ...input, chainId: this.chainId })
  }

  getVenue(input: Omit<hooks.GetVenueInput, 'chainId'>) {
    return hooks.useGetVenue({ ...input, chainId: this.chainId })
  }

  isVenueRegistered(input: Omit<hooks.IsVenueRegisteredInput, 'chainId'>) {
    return hooks.useIsVenueRegistered({ ...input, chainId: this.chainId })
  }

  nominateVenue(input: Omit<hooks.NominateVenueInput, 'chainId'>) {
    return hooks.useNominateVenue({ ...input, chainId: this.chainId })
  }

  updateVenue(input: Omit<hooks.UpdateVenueInput, 'chainId'>) {
    return hooks.useUpdateVenue({ ...input, chainId: this.chainId })
  }
}

// ====================================
// Hook to use SelloutSDK
// ====================================
export function useSelloutSDK(
  chainId: typeof base.id | typeof baseSepolia.id,
  smartAccountClient?: SmartAccountClient
): SelloutSDK {
  const config = useConfig()

  return useMemo(() => {
    return new SelloutSDK(config, chainId, smartAccountClient)
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
