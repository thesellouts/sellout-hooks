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
    return hooks.proposeShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  cancelShow(input: Omit<hooks.CancelShowType, 'chainId'>) {
    return hooks.cancelShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  completeShow(input: Omit<hooks.CompleteShowType, 'chainId'>) {
    return hooks.completeShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getNumberOfVoters(input: Omit<hooks.GetNumberOfVotersInput, 'chainId'>) {
    return hooks.getNumberOfVotersCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowById(input: Omit<hooks.GetShowByIdInput, 'chainId'>) {
    return hooks.getShowByIdCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowOrganizer(input: Omit<hooks.GetShowOrganizerInput, 'chainId'>) {
    return hooks.getShowOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowStatus(input: Omit<hooks.GetShowStatusInput, 'chainId'>) {
    return hooks.getShowStatusCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowToTicketProxy(
    input: Omit<hooks.GetShowToTicketProxyInput, 'chainId'>
  ) {
    return hooks.getShowToTicketProxyCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowToVenueProxy(input: Omit<hooks.GetShowToVenueProxyInput, 'chainId'>) {
    return hooks.getShowToVenueProxyCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getTicketTierInfo(input: Omit<hooks.GetTicketTierInfoInput, 'chainId'>) {
    return hooks.getTicketTierInfoCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  hasTicket(input: Omit<hooks.HasTicketInput, 'chainId'>) {
    return hooks.hasTicketCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isArtist(input: Omit<hooks.IsArtistInput, 'chainId'>) {
    return hooks.isArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isOrganizer(input: Omit<hooks.IsOrganizerInput, 'chainId'>) {
    return hooks.isOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  payout(input: Omit<hooks.PayoutType, 'chainId'>) {
    return hooks.payoutCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  refundBribe(input: Omit<hooks.RefundBribeType, 'chainId'>) {
    return hooks.refundBribeCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  refundTicket(input: Omit<hooks.RefundTicketType, 'chainId'>) {
    return hooks.refundTicketCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  voteForEmergencyRefund(
    input: Omit<hooks.VoteForEmergencyRefundType, 'chainId'>
  ) {
    return hooks.voteForEmergencyRefundCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  withdrawRefund(input: Omit<hooks.WithdrawRefundType, 'chainId'>) {
    return hooks.withdrawRefundCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // BOX OFFICE
  // ====================================
  getTicketPricePaid(input: Omit<hooks.GetTicketPricePaidInput, 'chainId'>) {
    return hooks.getTicketPricePaidCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getTotalTicketsSold(input: Omit<hooks.GetTotalTicketsSoldInput, 'chainId'>) {
    return hooks.getTotalTicketsSoldCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getWalletTokenIds(input: Omit<hooks.GetWalletTokenIdsInput, 'chainId'>) {
    return hooks.getWalletTokenIdsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isTicketOwner(input: Omit<hooks.IsTicketOwnerInput, 'chainId'>) {
    return hooks.isTicketOwnerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  // ====================================
  // SHOW VAULT
  // ====================================
  calculateTotalPayoutAmount(
    input: Omit<hooks.CalculateTotalPayoutAmountInput, 'chainId'>
  ) {
    return hooks.calculateTotalPayoutAmountCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowPaymentToken(input: Omit<hooks.GetShowPaymentTokenInput, 'chainId'>) {
    return hooks.getShowPaymentTokenCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowTokenVault(input: Omit<hooks.GetShowTokenVaultInput, 'chainId'>) {
    return hooks.getShowTokenVaultCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowVault(input: Omit<hooks.GetShowVaultInput, 'chainId'>) {
    return hooks.getShowVaultCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  // ====================================
  // TICKET
  // ====================================
  getTicketPricePaidAndTierIndex(
    input: Omit<hooks.GetTicketPricePaidAndTierIndexInput, 'chainId'>
  ) {
    return hooks.getTicketPricePaidAndTierIndexCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  purchaseTickets(input: Omit<hooks.PurchaseTicketsType, 'chainId'>) {
    return hooks.purchaseTicketsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  setDefaultURIForShow(input: Omit<hooks.SetDefaultURIForShowType, 'chainId'>) {
    return hooks.setDefaultURIForShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  setTokenURI(input: Omit<hooks.SetTokenURIType, 'chainId'>) {
    return hooks.setTokenURICore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // VENUE
  // ====================================
  getDateVotes(input: Omit<hooks.GetDateVotesInput, 'chainId'>) {
    return hooks.getDateVotesCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getHasDateVoted(input: Omit<hooks.GetHasDateVotedInput, 'chainId'>) {
    return hooks.getHasDateVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getHasTicketOwnerVoted(
    input: Omit<hooks.GetHasTicketOwnerVotedInput, 'chainId'>
  ) {
    return hooks.getHasTicketOwnerVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getHasVoted(input: Omit<hooks.GetHasVotedInput, 'chainId'>) {
    return hooks.getHasVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getPreviousDateVote(input: Omit<hooks.GetPreviousDateVotesInput, 'chainId'>) {
    return hooks.getPreviousDateVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getPreviousVote(input: Omit<hooks.GetPreviousVoteInput, 'chainId'>) {
    return hooks.getPreviousVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getProposal(input: Omit<hooks.GetProposalInput, 'chainId'>) {
    return hooks.getProposalCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getProposalPeriod(input: Omit<hooks.GetProposalPeriodInput, 'chainId'>) {
    return hooks.getProposalPeriodCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getProposalsCount(input: Omit<hooks.GetProposalsCountInput, 'chainId'>) {
    return hooks.getProposalsCountCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getRefunds(input: Omit<hooks.GetRefundsInput, 'chainId'>) {
    return hooks.getRefundsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getSelectedDate(input: Omit<hooks.GetSelectedDateInput, 'chainId'>) {
    return hooks.getSelectedDateCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getSelectedProposalIndex(
    input: Omit<hooks.GetSelectedProposalIndexInput, 'chainId'>
  ) {
    return hooks.getSelectedProposalIndexCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowProposals(input: Omit<hooks.GetShowProposalsInput, 'chainId'>) {
    return hooks.getShowProposalsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getVotingPeriods(input: Omit<hooks.GetVotingPeriodsInput, 'chainId'>) {
    return hooks.getVotingPeriodsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  submitProposal(input: Omit<hooks.SubmitProposal, 'chainId'>) {
    return hooks.submitProposalCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  ticketHolderVenueVote(input: Omit<hooks.TicketHolderVenueVote, 'chainId'>) {
    return hooks.ticketHolderVenueVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  vote(input: Omit<hooks.Vote, 'chainId'>) {
    return hooks.voteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  voteForDate(input: Omit<hooks.VoteForDate, 'chainId'>) {
    return hooks.voteForDateCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - ARTIST
  // ====================================
  acceptArtistNomination(
    input: Omit<hooks.AcceptArtistNominationInput, 'chainId'>
  ) {
    return hooks.acceptArtistNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  deregisterArtist(input: Omit<hooks.DeregisterArtistInput, 'chainId'>) {
    return hooks.deregisterArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getArtist(input: Omit<hooks.GetArtistInput, 'chainId'>) {
    return hooks.getArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isArtistRegistered(input: Omit<hooks.IsArtistRegisteredInput, 'chainId'>) {
    return hooks.isArtistRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  nominateArtist(input: Omit<hooks.NominateArtistInput, 'chainId'>) {
    return hooks.nominateArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  updateArtist(input: Omit<hooks.UpdateArtistInput, 'chainId'>) {
    return hooks.updateArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - ORGANIZER
  // ====================================
  acceptOrganizerNomination(
    input: Omit<hooks.AcceptOrganizerNominationInput, 'chainId'>
  ) {
    return hooks.acceptOrganizerNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  deregisterOrganizer(input: Omit<hooks.DeregisterOrganizerInput, 'chainId'>) {
    return hooks.deregisterOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getOrganizer(input: Omit<hooks.GetOrganizerInput, 'chainId'>) {
    return hooks.getOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isOrganizerRegistered(
    input: Omit<hooks.IsOrganizerRegisteredInput, 'chainId'>
  ) {
    return hooks.isOrganizerRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  nominateOrganizer(input: Omit<hooks.NominateOrganizerInput, 'chainId'>) {
    return hooks.nominateOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  updateOrganizer(input: Omit<hooks.UpdateOrganizerInput, 'chainId'>) {
    return hooks.updateOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REFERRAL
  // ====================================
  decrementReferralCredits(
    input: Omit<hooks.DecrementReferralCreditsInput, 'chainId'>
  ) {
    return hooks.decrementReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getReferralCredits(input: Omit<hooks.GetReferralCreditsInput, 'chainId'>) {
    return hooks.getReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  incrementReferralCredits(
    input: Omit<hooks.IncrementReferralCreditsInput, 'chainId'>
  ) {
    return hooks.incrementReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  setCreditControlPermission(
    input: Omit<hooks.SetCreditControlPermissionInput, 'chainId'>
  ) {
    return hooks.setCreditControlPermissionCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - VENUE
  // ====================================
  acceptVenueNomination(
    input: Omit<hooks.AcceptVenueNominationInput, 'chainId'>
  ) {
    return hooks.acceptVenueNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  deregisterVenue(input: Omit<hooks.DeregisterVenueInput, 'chainId'>) {
    return hooks.deregisterVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getVenue(input: Omit<hooks.GetVenueInput, 'chainId'>) {
    return hooks.getVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isVenueRegistered(input: Omit<hooks.IsVenueRegisteredInput, 'chainId'>) {
    return hooks.isVenueRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  nominateVenue(input: Omit<hooks.NominateVenueInput, 'chainId'>) {
    return hooks.nominateVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  updateVenue(input: Omit<hooks.UpdateVenueInput, 'chainId'>) {
    return hooks.updateVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
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
