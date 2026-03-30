'use client';

import type { RegionConfig, NodeDefinition, NodeValue } from '@/lib/sales-model/types';

interface Props {
  regions: RegionConfig[];
  nodesData: Record<string, NodeValue>;
  nodeDefs: NodeDefinition[];
  isZh: boolean;
}

/** Count how many nodes have regional data for this region's key retailers. */
function getRegionalDataCount(
  region: RegionConfig,
  nodesData: Record<string, NodeValue>,
  nodeDefs: NodeDefinition[],
): number {
  // Rough heuristic: count nodes with non-null values that mention a region's retailers in notes
  let count = 0;
  for (const nd of nodeDefs) {
    const val = nodesData[String(nd.id)];
    if (!val || val.raw == null) continue;
    // Check if note mentions any retailer for this region
    const note = (val.note ?? '').toLowerCase();
    const ref = (val.sourceRef ?? '').toLowerCase();
    for (const retailer of region.keyRetailers) {
      if (note.includes(retailer.toLowerCase()) || ref.includes(retailer.toLowerCase())) {
        count++;
        break;
      }
    }
  }
  return count;
}

function DiffusionBadge({ order }: { order: number }) {
  const colors: Record<number, string> = {
    1: 'bg-cert-500/20 text-cert-600',
    2: 'bg-steel-100 text-steel-600',
    3: 'bg-steel-100 text-steel-600',
    4: 'bg-brass-100 text-brass-700',
    5: 'bg-brass-100 text-brass-700',
    6: 'bg-metal-100 text-metal-600',
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${colors[order] ?? 'bg-metal-100 text-metal-600'}`}
    >
      #{order}
    </span>
  );
}

export default function RegionalPanel({ regions, nodesData, nodeDefs, isZh }: Props) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-semibold text-steel-800">
        {isZh ? '區域擴散' : 'Regional Diffusion'}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((region) => {
          const dataCount = getRegionalDataCount(region, nodesData, nodeDefs);
          const isSparse = dataCount < 2;

          return (
            <div
              key={region.id}
              className="rounded-lg border border-metal-200 bg-white p-4 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-steel-800">{region.nameZh}</span>
                  <span className="ml-1.5 text-sm text-metal-400">{region.name}</span>
                </div>
                <DiffusionBadge order={region.diffusionOrder} />
              </div>

              {/* Key retailers */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {region.keyRetailers.map((r) => (
                  <span
                    key={r}
                    className="rounded-full bg-steel-50 px-2 py-0.5 text-xs text-steel-600"
                  >
                    {r}
                  </span>
                ))}
              </div>

              {/* Data coverage */}
              <div className="mt-3 text-xs text-metal-500">
                {isZh ? '相關資料點' : 'Related data points'}: {dataCount}
              </div>

              {/* Sparse warning */}
              {isSparse && (
                <div className="mt-2 rounded bg-safety-500/10 px-2 py-1 text-xs text-safety-600">
                  {isZh ? '資料不足 -- 部分推估' : 'Partial data -- estimation may be unreliable'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
