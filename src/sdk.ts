import { Config } from '@wagmi/core'
import { SmartAccountClient } from 'permissionless'
import { useMemo } from 'react'
import { base, baseSepolia } from 'viem/chains'
import { useConfig } from 'wagmi'

import { getTicketPricePaidCore } from './boxOffice/getTicketPricePaid'
import { getTotalTicketsSoldCore } from './boxOffice/getTotalTicketsSold'
import { getWalletTokenIdsCore } from './boxOffice/getWalletTokenIds'
import { isTicketOwnerCore } from './boxOffice/isTicketOwner'
import {
  ContractInteractor,
  createContractInteractor
} from './contractInteractor'
import * as hooks from './hooks'
import { getRefundsCore, voteCore, voteForDateCore } from './hooks'
import { acceptArtistNominationCore } from './registry/artist/acceptArtistNomination'
import { deregisterArtistCore } from './registry/artist/deregisterArtist'
import { getArtistCore } from './registry/artist/getArtist'
import { isArtistRegisteredCore } from './registry/artist/isArtistRegistered'
import { nominateArtistCore } from './registry/artist/nominateArtist'
import { updateArtistCore } from './registry/artist/updateArtist'
import { acceptOrganizerNominationCore } from './registry/organizer/acceptOrganizerNomination'
import { deregisterOrganizerCore } from './registry/organizer/deregisterOrganizer'
import { getOrganizerCore } from './registry/organizer/getOrganizer'
import { isOrganizerRegisteredCore } from './registry/organizer/isOrganizerRegistered'
import { nominateOrganizerCore } from './registry/organizer/nominateOrganizer'
import { updateOrganizerCore } from './registry/organizer/updateOrganizer'
import { decrementReferralCreditsCore } from './registry/referral/decrementReferralCredits'
import { getReferralCreditsCore } from './registry/referral/getReferralCredits'
import { incrementReferralCreditsCore } from './registry/referral/incrementReferralCredits'
import { setCreditControlPermissionCore } from './registry/referral/setCreditControlPermissions'
import { acceptVenueNominationCore } from './registry/venue/acceptVenueNomination'
import { deregisterVenueCore } from './registry/venue/deregisterVenue'
import { getVenueCore } from './registry/venue/getVenue'
import { isVenueRegisteredCore } from './registry/venue/isVenueRegistered'
import { nominateVenueCore } from './registry/venue/nominateVenue'
import { updateVenueCore } from './registry/venue/updateVenue'
import { cancelShowCore } from './show/cancelShow'
import { completeShowCore } from './show/completeShow'
import { getNumberOfVotersCore } from './show/getNumberOfVoters'
import { getShowByIdCore } from './show/getShowById'
import { getShowOrganizerCore } from './show/getShowOrganizer'
import { getShowStatusCore } from './show/getShowStatus'
import { getShowToTicketProxyCore } from './show/getShowToTicketProxy'
import { getShowToVenueProxyCore } from './show/getShowToVenueProxy'
import { getTicketTierInfoCore } from './show/getTicketTierInfo'
import { hasTicketCore } from './show/hasTicket'
import { isArtistCore } from './show/isArtist'
import { isOrganizerCore } from './show/isOrganizer'
import { payoutCore } from './show/payout'
import { proposeShowCore } from './show/proposeShow'
import { refundBribeCore } from './show/refundBribe'
import { refundTicketCore } from './show/refundTicket'
import { voteForEmergencyRefundCore } from './show/voteForEmergencyRefund'
import { withdrawRefundCore } from './show/withdrawRefund'
import { calculateTotalPayoutAmountCore } from './showVault/calculateTotalPayoutAmount'
import { getShowPaymentTokenCore } from './showVault/getShowPaymentToken'
import { getShowTokenVaultCore } from './showVault/showTokenVault'
import { getShowVaultCore } from './showVault/showVault'
import { getTicketPricePaidAndTierIndexCore } from './ticket/getTicketPricePaidAndTierIndex'
import { purchaseTicketsCore } from './ticket/purchaseTickets'
import { setDefaultURIForShowCore } from './ticket/setDefaultURIForShow'
import { setTokenURICore } from './ticket/setTokenURI'
import { getDateVotesCore } from './venue/getDateVotes'
import { getHasDateVotedCore } from './venue/getHasDateVoted'
import { getHasTicketOwnerVotedCore } from './venue/getHasTicketOwnerVoted'
import { getHasVotedCore } from './venue/getHasVoted'
import { getPreviousDateVoteCore } from './venue/getPreviousDateVotes'
import { getPreviousVoteCore } from './venue/getPreviousVote'
import { getProposalCore } from './venue/getProposal'
import { getProposalPeriodCore } from './venue/getProposalPeriod'
import { getProposalsCountCore } from './venue/getProposalsCount'
import { getSelectedDateCore } from './venue/getSelectedDate'
import { getSelectedProposalIndexCore } from './venue/getSelectedProposalIndex'
import { getShowProposalsCore } from './venue/getShowProposals'
import { getVotingPeriodsCore } from './venue/getVotingPeriods'
import { submitProposalCore } from './venue/submitProposal'
import { ticketHolderVenueVoteCore } from './venue/ticketHolderVenueVote'

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
  proposeShow(input: Omit<hooks.ProposeShow, 'chainId'>) {
    return proposeShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  cancelShow(input: Omit<hooks.CancelShow, 'chainId'>) {
    return cancelShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  completeShow(input: Omit<hooks.CompleteShow, 'chainId'>) {
    return completeShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getNumberOfVoters(input: Omit<hooks.GetNumberOfVoters, 'chainId'>) {
    return getNumberOfVotersCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowById(input: Omit<hooks.GetShowById, 'chainId'>) {
    return getShowByIdCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowOrganizer(input: Omit<hooks.GetShowOrganizer, 'chainId'>) {
    return getShowOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowStatus(input: Omit<hooks.GetShowStatus, 'chainId'>) {
    return getShowStatusCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowToTicketProxy(input: Omit<hooks.GetShowToTicketProxy, 'chainId'>) {
    return getShowToTicketProxyCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowToVenueProxy(input: Omit<hooks.GetShowToVenueProxy, 'chainId'>) {
    return getShowToVenueProxyCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getTicketTierInfo(input: Omit<hooks.GetTicketTierInfo, 'chainId'>) {
    return getTicketTierInfoCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  hasTicket(input: Omit<hooks.HasTicketInput, 'chainId'>) {
    return hasTicketCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isArtist(input: Omit<hooks.IsArtistInput, 'chainId'>) {
    return isArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isOrganizer(input: Omit<hooks.IsOrganizerInput, 'chainId'>) {
    return isOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  payout(input: Omit<hooks.Payout, 'chainId'>) {
    return payoutCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  refundBribe(input: Omit<hooks.RefundBribe, 'chainId'>) {
    return refundBribeCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  refundTicket(input: Omit<hooks.RefundTicket, 'chainId'>) {
    return refundTicketCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  voteForEmergencyRefund(input: Omit<hooks.VoteForEmergencyRefund, 'chainId'>) {
    return voteForEmergencyRefundCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  withdrawRefund(input: Omit<hooks.WithdrawRefund, 'chainId'>) {
    return withdrawRefundCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // BOX OFFICE
  // ====================================
  getTicketPricePaid(input: Omit<hooks.GetTicketPricePaid, 'chainId'>) {
    return getTicketPricePaidCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getTotalTicketsSold(input: Omit<hooks.GetTotalTicketsSold, 'chainId'>) {
    return getTotalTicketsSoldCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getWalletTokenIds(input: Omit<hooks.GetWalletTokenIds, 'chainId'>) {
    return getWalletTokenIdsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isTicketOwner(input: Omit<hooks.IsTicketOwner, 'chainId'>) {
    return isTicketOwnerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  // ====================================
  // SHOW VAULT
  // ====================================
  calculateTotalPayoutAmount(
    input: Omit<hooks.CalculateTotalPayoutAmount, 'chainId'>
  ) {
    return calculateTotalPayoutAmountCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowPaymentToken(input: Omit<hooks.GetShowPaymentToken, 'chainId'>) {
    return getShowPaymentTokenCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowTokenVault(input: Omit<hooks.GetShowTokenVault, 'chainId'>) {
    return getShowTokenVaultCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowVault(input: Omit<hooks.GetShowVault, 'chainId'>) {
    return getShowVaultCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  // ====================================
  // TICKET
  // ====================================
  getTicketPricePaidAndTierIndex(
    input: Omit<hooks.GetTicketPricePaidAndTierIndex, 'chainId'>
  ) {
    return getTicketPricePaidAndTierIndexCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  purchaseTickets(input: Omit<hooks.PurchaseTickets, 'chainId'>) {
    return purchaseTicketsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  setDefaultURIForShow(input: Omit<hooks.SetDefaultURIForShow, 'chainId'>) {
    return setDefaultURIForShowCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  setTokenURI(input: Omit<hooks.SetTokenURI, 'chainId'>) {
    return setTokenURICore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // VENUE
  // ====================================
  getDateVotes(input: Omit<hooks.GetDateVotes, 'chainId'>) {
    return getDateVotesCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getHasDateVoted(input: Omit<hooks.GetHasDateVoted, 'chainId'>) {
    return getHasDateVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getHasTicketOwnerVoted(input: Omit<hooks.GetHasTicketOwnerVoted, 'chainId'>) {
    return getHasTicketOwnerVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getHasVoted(input: Omit<hooks.GetHasVotedInput, 'chainId'>) {
    return getHasVotedCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getPreviousDateVote(input: Omit<hooks.GetPreviousDateVotes, 'chainId'>) {
    return getPreviousDateVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getPreviousVote(input: Omit<hooks.GetPreviousVote, 'chainId'>) {
    return getPreviousVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getProposal(input: Omit<hooks.GetProposal, 'chainId'>) {
    return getProposalCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getProposalPeriod(input: Omit<hooks.GetProposalPeriod, 'chainId'>) {
    return getProposalPeriodCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getProposalsCount(input: Omit<hooks.GetProposalsCount, 'chainId'>) {
    return getProposalsCountCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getRefunds(input: Omit<hooks.GetRefunds, 'chainId'>) {
    return getRefundsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getSelectedDate(input: Omit<hooks.GetSelectedDate, 'chainId'>) {
    return getSelectedDateCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getSelectedProposalIndex(
    input: Omit<hooks.GetSelectedProposalIndex, 'chainId'>
  ) {
    return getSelectedProposalIndexCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getShowProposals(input: Omit<hooks.GetShowProposals, 'chainId'>) {
    return getShowProposalsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  getVotingPeriods(input: Omit<hooks.GetVotingPeriods, 'chainId'>) {
    return getVotingPeriodsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  submitProposal(input: Omit<hooks.SubmitProposal, 'chainId'>) {
    return submitProposalCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  ticketHolderVenueVote(input: Omit<hooks.TicketHolderVenueVote, 'chainId'>) {
    return ticketHolderVenueVoteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  vote(input: Omit<hooks.Vote, 'chainId'>) {
    return voteCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  voteForDate(input: Omit<hooks.VoteForDate, 'chainId'>) {
    return voteForDateCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - ARTIST
  // ====================================
  acceptArtistNomination(input: Omit<hooks.AcceptArtistNomination, 'chainId'>) {
    return acceptArtistNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  deregisterArtist(input: Omit<hooks.DeregisterArtist, 'chainId'>) {
    return deregisterArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getArtist(input: Omit<hooks.GetArtist, 'chainId'>) {
    return getArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isArtistRegistered(input: Omit<hooks.IsArtistRegistered, 'chainId'>) {
    return isArtistRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  nominateArtist(input: Omit<hooks.NominateArtist, 'chainId'>) {
    return nominateArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  updateArtist(input: Omit<hooks.UpdateArtist, 'chainId'>) {
    return updateArtistCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - ORGANIZER
  // ====================================
  acceptOrganizerNomination(
    input: Omit<hooks.AcceptOrganizerNomination, 'chainId'>
  ) {
    return acceptOrganizerNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  deregisterOrganizer(input: Omit<hooks.DeregisterOrganizer, 'chainId'>) {
    return deregisterOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getOrganizer(input: Omit<hooks.GetOrganizer, 'chainId'>) {
    return getOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isOrganizerRegistered(input: Omit<hooks.IsOrganizerRegistered, 'chainId'>) {
    return isOrganizerRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  nominateOrganizer(input: Omit<hooks.NominateOrganizer, 'chainId'>) {
    return nominateOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  updateOrganizer(input: Omit<hooks.UpdateOrganizer, 'chainId'>) {
    return updateOrganizerCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REFERRAL
  // ====================================
  decrementReferralCredits(
    input: Omit<hooks.DecrementReferralCredits, 'chainId'>
  ) {
    return decrementReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getReferralCredits(input: Omit<hooks.GetReferralCredits, 'chainId'>) {
    return getReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  incrementReferralCredits(
    input: Omit<hooks.IncrementReferralCredits, 'chainId'>
  ) {
    return incrementReferralCreditsCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  setCreditControlPermission(
    input: Omit<hooks.SetCreditControlPermission, 'chainId'>
  ) {
    return setCreditControlPermissionCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  // ====================================
  // REGISTRY - VENUE
  // ====================================
  acceptVenueNomination(input: Omit<hooks.AcceptVenueNomination, 'chainId'>) {
    return acceptVenueNominationCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  deregisterVenue(input: Omit<hooks.DeregisterVenue, 'chainId'>) {
    return deregisterVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  getVenue(input: Omit<hooks.GetVenueInput, 'chainId'>) {
    return getVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  isVenueRegistered(input: Omit<hooks.IsVenueRegistered, 'chainId'>) {
    return isVenueRegisteredCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor
    )
  }

  nominateVenue(input: Omit<hooks.NominateVenue, 'chainId'>) {
    return nominateVenueCore(
      { ...input, chainId: this.chainId },
      this.contractInteractor,
      this.config
    )
  }

  updateVenue(input: Omit<hooks.UpdateVenueInput, 'chainId'>) {
    return updateVenueCore(
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


