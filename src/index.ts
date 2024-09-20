// Core exports
export * from './abis'
export * from './boxOffice'
export * from './contractInteractor'
export * from './utils'

// SDK export
export { sdk } from './sdk'

// Show Exports
export * from './show/cancelShow'
export * from './show/completeShow'
export * from './show/payout'
export * from './show/proposeShow'
export * from './show/refundBribe'
export * from './show/refundTicket'
export * from './show/voteForEmergencyRefund'
export * from './show/withdrawRefund'

// ShowVault Exports
export * from './showVault/calculateTotalPayoutAmount'
export * from './showVault/getShowPaymentToken'
export * from './showVault/showTokenVault'
export * from './showVault/showVault'

// BoxOffice Exports
export * from './boxOffice/getTicketPricePaid'
export * from './boxOffice/getTotalTicketsSold'
export * from './boxOffice/getWalletTokenIds'
export * from './boxOffice/isTicketOwner'

// Registry - Artist Exports
export * from './registry/artist/acceptArtistNomination'
export * from './registry/artist/deregisterArtist'
export * from './registry/artist/getArtist'
export * from './registry/artist/isArtistRegistered'
export * from './registry/artist/nominateArtist'
export * from './registry/artist/updateArtist'

// Registry - Organizer Exports
export * from './registry/organizer/acceptOrganizerNomination'
export * from './registry/organizer/deregsiterOrganizer'
export * from './registry/organizer/getOrganizer'
export * from './registry/organizer/isOrganizerRegistered'
export * from './registry/organizer/nominateOrganizer'
export * from './registry/organizer/updateOrganizer'

// Registry - Venue Exports
export * from './registry/venue/acceptVenueNomination'
export * from './registry/venue/deregisterVenue'
export * from './registry/venue/getVenue'
export * from './registry/venue/isVenueRegistered'
export * from './registry/venue/nominateVenue'
export * from './registry/venue/updateVenue'

// Registry - Referral Exports
export * from './registry/referral/decrementReferralCredits'
export * from './registry/referral/getReferralCredits'
export * from './registry/referral/incrementReferralCredits'
export * from './registry/referral/setCreditControlPermissions'

// Ticket Exports
export * from './ticket/getTicketPricePaidAndTierIndex'
export * from './ticket/purchaseTickets'
export * from './ticket/setDefaultURIForShow'
export * from './ticket/setTokenURI'

// Venue Exports
export * from './venue/getDateVotes'
export * from './venue/getHasDateVoted'
export * from './venue/getHasTicketOwnerVoted'
export * from './venue/getHasVoted'
export * from './venue/getPreviousDateVotes'
export * from './venue/getPreviousVote'
export * from './venue/getProposal'
export * from './venue/getProposalPeriod'
export * from './venue/getProposalsCount'
export * from './venue/getRefunds'
export * from './venue/getSelectedDate'
export * from './venue/getSelectedProposalIndex'
export * from './venue/getShowProposals'
export * from './venue/getVotingPeriods'
export * from './venue/submitProposal'
export * from './venue/ticketHolderVenueVote'
export * from './venue/vote'
export * from './venue/voteForDate'

// Export types for shared usage
export type {
  AcceptArtistNominationInput,
  AcceptOrganizerNominationInput,
  AcceptVenueNominationInput,
  CancelShowResult,
  CancelShowType,
  DecrementReferralCreditsInput,
  DeregisterArtistInput,
  DeregisterOrganizerInput,
  DeregisterVenueInput,
  GetArtistInput,
  GetOrganizerInput,
  GetReferralCreditsInput,
  GetShowProposalsInput,
  GetTicketPricePaidInput,
  GetTotalTicketsSoldInput,
  GetVenueInput,
  GetVotingPeriodsInput,
  GetWalletTokenIdsInput,
  IncrementReferralCreditsInput,
  IsArtistRegisteredInput,
  IsOrganizerRegisteredInput,
  IsTicketOwnerInput,
  IsVenueRegisteredInput,
  NominateArtistInput,
  NominateOrganizerInput,
  NominateVenueInput,
  ProposeShowResult,
  ProposeShowType,
  RefundBribeResult,
  RefundBribeType,
  RefundTicketResult,
  RefundTicketType,
  SetCreditControlPermissionInput,
  SubmitProposal,
  TicketHolderVenueVote,
  UpdateArtistInput,
  UpdateOrganizerInput,
  UpdateVenueInput,
  Vote,
  VoteForDate,
  VoteForEmergencyRefundResult,
  VoteForEmergencyRefundType,
  WithdrawRefundResult,
  WithdrawRefundType
} from './hooks'

// Export Transaction Result Interface
export interface TransactionResult {
  hash: `0x${string}`
  receipt: {
    transactionHash: `0x${string}`
    blockNumber: bigint
    status: 'success' | 'reverted'
  }
}
