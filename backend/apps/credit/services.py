from django.db import transaction
from django.utils import timezone

from .models import ApplicationStatus, LoanApplication

S = ApplicationStatus

ALLOWED_TRANSITIONS = {
    S.DRAFT: {S.SUBMITTED, S.CANCELLED, S.EXPIRED},
    S.SUBMITTED: {S.UNDER_REVIEW, S.CANCELLED, S.EXPIRED},
    S.UNDER_REVIEW: {S.MORE_INFORMATION_REQUIRED, S.APPROVED, S.DECLINED,  S.EXPIRED},
    S.MORE_INFORMATION_REQUIRED: {S.UNDER_REVIEW, S.CANCELLED, S.EXPIRED},
    S.APPROVED: {S.LOAN_CREATED, S.EXPIRED},
    S.DECLINED: set(),
    S.CANCELLED: set(),
    S.EXPIRED: set()
   
}


class InvalidTransition(Exception):
    pass
    


def transition(application_id, new_status):
    with transaction.atomic():
        # 1. re-fetch the row LOCKED
        application = LoanApplication.objects.select_for_update().get(id=application_id)
        # 2. check new_status is allowed from the current status
        if new_status not in ALLOWED_TRANSITIONS[application.status]:
            raise InvalidTransition(
                f"Cannot transition from {application.status} to {new_status}"
            )
        # 3. update status (and submitted_at, if moving to SUBMITTED)
        application.status = new_status
        if new_status == S.SUBMITTED:
            application.submitted_at = timezone.now()
        # 4. save and return it
        application.save()
        return application
