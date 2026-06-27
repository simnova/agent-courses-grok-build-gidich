/**
 * @axc/domain
 * Shared domain seedwork and primitives.
 * Reimplements minimal patterns inspired by cellix domain-seedwork (license compatible approach).
 */
export interface DomainEvent {
	readonly occurredAt: Date;
	readonly eventType: string;
}

// health primitives live in @axc/axc/domain for now (scaffold minimal)
