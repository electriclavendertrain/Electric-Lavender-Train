import {useDataset, type NavbarProps} from 'sanity'
import {datasetLabel, isProductionDataset} from '../datasetLabel'

/**
 * Wraps the default Studio navbar. On any dataset other than production it
 * adds a full-width caution strip so a local or non-live Studio cannot be
 * mistaken for the one the public website builds from. Production renders
 * the unmodified navbar.
 */
export function DatasetNavbar(props: NavbarProps) {
  const dataset = useDataset()

  if (isProductionDataset(dataset)) {
    return props.renderDefault(props)
  }

  return (
    <>
      <div
        style={{
          background: '#f2b632',
          color: '#1f1500',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.4,
          padding: '6px 12px',
          textAlign: 'center',
        }}
      >
        You are editing the {datasetLabel(dataset)} dataset. Changes made here do not appear on
        the live website.
      </div>
      {props.renderDefault(props)}
    </>
  )
}
