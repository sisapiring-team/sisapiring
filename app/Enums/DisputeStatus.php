<?php

namespace App\Enums;

enum DisputeStatus: string
{
    case Open = 'open';
    case Investigating = 'investigating';
    case ResolvedRefund = 'resolved_refund';
    case ResolvedSanction = 'resolved_sanction';
    case Rejected = 'rejected';
}
